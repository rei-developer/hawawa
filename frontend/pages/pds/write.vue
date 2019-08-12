<template>
  <div>
    <Loading v-if='loading' />
    <el-row>
      <el-col :xl='4' hidden-lg-and-down><div class='blank'></div></el-col>
      <el-col :xl='16'>
        <div class='AD hidden-mobile'>
          <iframe src='/ad.html' />
        </div>
        <div class='AD hidden-desktop'>
          <iframe src='/ad-mobile.html' />
        </div>
        <div class='containerSubject'>
          <font-awesome-icon icon='pencil-alt' />
          자료실 업로드
        </div>
        <div class='topicWrite'>
          <div class='marginBottom' v-if='$store.state.user.isLogged && $store.state.user.isAdmin > 0'>
            <el-switch v-model='form.isNotice' active-color='#29313D'></el-switch>
            공지사항
          </div>
          <div class='marginBottom'>
            <el-input size='medium' placeholder='100자 제한' v-model='form.title' autofocus>
              <template slot='prepend'>제목</template>
            </el-input>
          </div>
          <div class='marginBottom'>
            <el-input size='medium' placeholder='메가 URL 링크' v-model='form.url'>
              <template slot='prepend'>메가 URL 링크</template>
            </el-input>
          </div>
          <div class='marginBottom'>
            <el-input size='medium' placeholder='패스워드' v-model='form.password'>
              <template slot='prepend'>패스워드</template>
            </el-input>
          </div>
          <div class='marginBottom'>
            <el-input type='number' size='medium' value='20' placeholder='다운로드 가격' v-model='form.cost'>
              <template slot='prepend'>다운로드 가격</template>
            </el-input>
          </div>
          <div class='event' @click='htmlMode = !htmlMode'>
            <span v-if='htmlMode'>
              <font-awesome-icon icon='edit' />
              에디터 모드
            </span>
            <span v-else>
              <font-awesome-icon icon='code' />
              HTML 모드
            </span>
          </div>
          <div v-if='htmlMode'>
            <textarea
              class='content'
              placeholder='이곳에 내용을 입력하세요.'
              v-model='form.content' />
          </div>
          <div v-else>
            <no-ssr placeholder='에디터를 불러오고 있습니다...'>
              <vue-editor
                id='editor'
                :editorToolbar='[
                  ["bold", "italic", "underline", "strike"],
                  [{ "align": "" }, { "align": "center" }, { "align": "right" }, { "align": "justify" }],
                  ["blockquote"],
                  [{ "header": 1 }, { "header": 2 }],
                  [{ "list": "ordered"}, { "list": "bullet" }, { "list": "check" }],
                  [{ "indent": "-1"}, { "indent": "+1" }],
                  [{ "color": [] }, { "background": [] }],
                  ["link", "clean"]
                ]'
                :editorOptions='{ placeholder: "이곳에 내용을 입력하세요." }'
                v-model='form.content' />
            </no-ssr>
          </div>
          <div class='marginTop'>
            <input
              type='file'
              multiple='multiple'
              @change='imageUpload' />
            10MB
          </div>
        </div>
        <div class='marginVertical'>
          <el-button class='widthAll' type='primary' size='medium' @click='write'>업로드</el-button>
        </div>
      </el-col>
      <el-col :xl='4' hidden-lg-and-down><div class='blank'></div></el-col>
    </el-row>
  </div>
</template>

<script>
  import Library from '~/assets/lib.js'
  import Loading from '~/components/loading.vue'
  
  export default {
    components: { Loading },
    data() {
      return {
        form: {
          url: '',
          password: '',
          cost: 20,
          title: '',
          content: '<p></p>',
          isNotice: false
        },
        images: [],
        selectedImage: null,
        editor: null,
        htmlMode: false,
        loading: false
      }
    },
    methods: {
      write: async function() {
        if (this.loading) return
        if (this.form.title === '') return this.$message.error('메가 URL 링크를 입력하세요.')
        if (this.form.cost < 20) return this.$message.error('다운로드 가격은 20 이상으로 설정하세요.')
        if (this.form.title === '') return this.$message.error('제목을 입력하세요.')
        if (this.form.content === '' || this.form.content === '<p></p>') return this.$message.error('본문을 입력하세요.')
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.loading = true
        const data = await this.$axios.$post('/api/pds/write', {
          isNotice: this.form.isNotice,
          url: this.form.url,
          password: this.form.password,
          cost: this.form.cost,
          title: this.form.title,
          content: this.form.content,
          images: this.images
        }, {
          headers: { 'x-access-token': token }
        })
        if (data.status === 'fail') {
          this.loading = false
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$router.push({ path: `/pds/${data.pdsId}` })
      },
      imageUpload: async function(e) {
        if (this.loading || e.target.files.length < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.loading = true
        await this.imageUploadToServer(e.target.files)
      },
      imageUploadToServer: async function(files, index = 0) {
        const LIMITS = 10485760
        const formData = new FormData()
        formData.append('type', 'file')
        formData.append('image', files[index], files[index].name)
        if (!/(.gif|.png|.jpg|.jpeg|.webp)/i.test(files[index].name)) this.$message.error(`${index + 1}번째 이미지 업로드 실패... (gif, png, jpg, jpeg, webp만 가능)`)
        else if (files[index].size > LIMITS) this.$message.error(`${index + 1}번째 이미지 업로드 실패... (10MB 이하만 업로드 가능)`)
        else {
          const data = await this.$axios.$post(
            '/api/cloud/pds',
            formData,
            { headers: { 'content-type': 'multipart/form-data' } }
          )
          if (data.status === 'ok') {
            const name = files[index].name
            const filename = `https://hawawa.co.kr/img/${data.filename}`
            this.$message.success(`${index + 1}번째 이미지 (${name}) 업로드 성공!`)
            this.images.push({
              name,
              filename: data.filename,
              link: filename
            })
            this.selectedImage = filename
            this.form.content += `<p><img src='${filename}'></p><p></p>`
          } else {
            this.$message.error(`${index + 1}번째 이미지 업로드 실패...`)
          }
        }
        if (index === files.length - 1) return this.loading = false
        await this.imageUploadToServer(files, index + 1)
      }
    }
  }
</script>

<style>
  .topicWrite {
    padding: .5rem;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
    background: #FFF;
    font-size: .9rem;
  }
  .topicWrite .event {
    display: inline-block;
    width: fit-content;
    margin-bottom: .5rem;
    padding: .25rem .5rem;
    border-radius: .25rem;
    background: #29313D;
    color: #FFF;
    font-size: .7rem;
    text-align: center;
  }
  .topicWrite .event:hover {
    opacity: .8;
    cursor: pointer;
  }
  .topicWrite textarea {
    width: 100%;
    margin-bottom: -5px;
    padding: .5rem;
    border: 1px solid #CCC;
    font-size: .8rem;
    outline: none;
  }
  .topicWrite textarea.chart { margin-bottom: -13px }
  .topicWrite textarea.content { height: 249px }
</style>
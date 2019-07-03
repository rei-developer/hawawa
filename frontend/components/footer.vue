<template>
  <div class='Footer'>
    <el-row :gutter='0'>
      <el-col :xl='4' hidden-lg-and-down><div class='blank' /></el-col>
      <el-col :xl='16'>
        <el-row :gutter='50'>
          <el-col :span='8'>
            <div class='column-head'>사이트 안내</div>
            <p>하와와는 연예인, 애니메이션, 정치, 유머 등 타인과의 소통을 중시하는 익명 커뮤니티 사이트입니다. 이곳은 친목 행위를 허용하지 않습니다.</p>
          </el-col>
          <el-col :span='8'>
            <div class='column-head'>이용정책</div>
            <p>이용정책 작성중...</p>
            <p>개인정보취급방침 책임자 : 나코 (admin@nakonako.net)</p>
          </el-col>
          <el-col :span='8'>
            <div class='column-head'>광고 및 제휴 문의</div>
            <p></p>
          </el-col>
        </el-row>
      </el-col>
      <el-col :xl='4' hidden-lg-and-down><div class='blank' /></el-col>
    </el-row>
  </div>
</template>

<style>
  .Footer {
    clear: both;
    position: relative;
    margin: 0 auto;
    padding-bottom: 1rem;
    background-color: #ECEEF1;
    color: #9099A3;
  }

  .column-head {
    font-size: 14px;
    line-height: 17px;
    color: #55606e;
    padding: 15px 15px 5px 0;
  }

  .Footer > p {
    font-size: 12px;
    text-align: justify;
    line-height: 170%;
    margin-top: 5px;
    margin-bottom: 3px;
  }
</style>
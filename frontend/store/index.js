export const state = () => ({
  forceUpdate: 0,
  topic: [],
  aside: false,
  loading: false
})

export const mutations = {
  forceUpdate: state => ++state.forceUpdate,
  setTopic: (state, topic) => state.topic = topic,
  setAside: state => state.aside = !state.aside,
  setLoading: (state, toggle = false) => state.loading = toggle
}
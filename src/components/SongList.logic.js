import SongCard from './SongCard.vue'

export default {
  components: { SongCard },
  props: {
    songs: {
      type: Array,
      default: () => [],
    },
    searchQuery: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return {}
  }
}

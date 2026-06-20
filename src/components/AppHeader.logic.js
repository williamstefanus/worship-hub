import { RouterLink } from 'vue-router'

export default {
  components: { RouterLink },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return {}
  }
}

declare module "*.vue" {
  import Vue from 'vue'
  export default Vue
}

declare module "vue/types/options" {
  type Hooks = App.AppInstance & Page.PageInstance;
  interface ComponentOptions<V extends Vue> extends Hooks {
      /**
       * 组件类型
       */
      mpType?: string;
  }
}
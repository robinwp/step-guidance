import StepGuidance from './core/step.guidance';
import VueStepGuidance from './platform/vue';


function install(Vue) {
  StepGuidance.isVue = true;
  VueStepGuidance.install(Vue);
}

const StepGuidanceVue = {
  install,
};

export {
  StepGuidance,
  StepGuidanceVue,
};

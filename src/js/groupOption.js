import EventEmitter from 'events';
import texts from './texts';

export default class extends EventEmitter {
  constructor(groupOption) {
    super();
    console.log(groupOption);
    this.groupOption = groupOption;

    this.name = this.groupOption.name;
    this.ingredients = this.groupOption.ingredients;

    if (this.groupOption.min >= 1) {
      this.mandatoryOrOptionalText = texts.mandatory;
    } else {
      this.mandatoryOrOptionalText = texts.optional;
    }

    this.maxLimitText = `${texts.maxLimit} ${this.groupOption.max}`;
  }
}

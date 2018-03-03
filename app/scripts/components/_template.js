let instance = null;

/**
 *
 *
 * @class UserStore
 */
class UserStore {

  constructor () {
    if (!instance) {
      instance = this;
    }
    this.time = new Date();

    return instance;
  }

 // rest is the same code as preceding example

}

const Instance = new UserStore();
Object.freeze(Instance);

export default Instance;

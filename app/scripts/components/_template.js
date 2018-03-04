let instance = null;

class UserStore {
  constructor () {
    if (!instance) {
      instance = this;
    }
    this.time = new Date();

    return instance;
  }
}

const Instance = new UserStore();
Object.freeze(Instance);

export default Instance;

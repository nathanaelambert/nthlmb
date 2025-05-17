// js/Observable.js
export class Observable {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  notify(data) {
    this.observers.forEach(obs => obs.update(data));
  }
}
  
let updateView: () => void = () => null;

export function setUpdateView(u: () => void) {
  updateView = u;
}

export function update() {
  updateView();
}

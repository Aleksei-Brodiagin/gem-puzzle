const createNode = (parent, className, textContent, tag = 'div') => {
  const element = document.createElement(tag);
  element.className = className;
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  parent.appendChild(element);
  return element;
};

module.exports = createNode;

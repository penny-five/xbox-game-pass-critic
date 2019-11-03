export default (array, value, options) => (array.includes(value) ? options.fn(this) : options.inverse(this));

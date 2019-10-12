export default (first, second, options) => (first === second ? options.fn(this) : options.inverse(this));

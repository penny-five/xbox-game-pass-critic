import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';

const render: HttpFunction = (req, res) => {
  res.send('ass');
};

export default render;

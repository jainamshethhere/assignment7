import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';

import ProductList from './ProductList.jsx';

const element = (<ProductList />);

ReactDOM.render(element, document.getElementById('contents'));

if (module.hot) {
  module.hot.accept();
}

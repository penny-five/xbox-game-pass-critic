import * as _ from 'lodash';

import * as cache from '../games-cache';

import renderAppTemplate from '../views/app.hbs';
import styles from '../assets/styles.scss';

/**
 * @type {import('aws-lambda').APIGatewayProxyHandler}
 */
export default async event => {
  let games = await cache.getAll();

  const querystring = event.queryStringParameters;
  const sort = (querystring && querystring.sort) || 'score';
  const platform = (querystring && querystring.platform) || 'all';

  let filteredGames;

  if (platform === 'desktop') {
    filteredGames = games.filter(game => game.availableOnPC);
  } else if (platform === 'console') {
    filteredGames = games.filter(game => game.availableOnConsole);
  } else {
    filteredGames = games;
  }

  let sortedGames;

  if (sort === 'score') {
    sortedGames = _.sortBy(filteredGames, game => game.averageScore || -1).reverse();
  } else {
    sortedGames = _.sortBy(filteredGames, game => game.title.toLowerCase());
  }

  const context = {
    title: 'Xbox Game Pass Critic',
    styles: `<style>${styles}</style>`,
    filters: {
      platform,
      sort
    },
    games: sortedGames
  };

  const html = renderAppTemplate(context);

  return {
    statusCode: 200,
    headers: { 'content-type': 'text/html' },
    body: html
  };
};

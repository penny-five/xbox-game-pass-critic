import got from 'got';
import * as _ from 'lodash';

import * as logger from '../logger';
import { sleep } from '../utils';

const OPENCRITIC_API_BASE_URL = 'https://opencritic.com/api';

/**
 * Fetch id for a game that most closely matches the provided searchphrase.
 *
 * @param {string} searchphrase
 */
const fetchGameId = async searchphrase => {
  const response = await got.get('meta/search', {
    json: true,
    baseUrl: OPENCRITIC_API_BASE_URL,
    query: {
      criteria: searchphrase
    }
  });

  const matches = response.body.filter(item => item.relation === 'game');

  if (matches.length === 0) return null;

  const closestMatch = matches[0];

  if (closestMatch.dist > 0.3) return null;

  return closestMatch.id;
};

/**
 *
 * @param {string} id Opencritic game id
 */
const fetchGameDetails = async id => {
  logger.info('opencritic api', 'fetch game', { id });
  const response = await got.get(`game/${id}`, {
    json: true,
    baseUrl: OPENCRITIC_API_BASE_URL
  });

  const { averageScore, topCriticScore, percentRecommended, numReviews, numTopCriticReviews } = response.body;

  return _.omitBy(
    {
      averageScore: averageScore > 0 ? averageScore : null,
      topCriticScore: topCriticScore > 0 ? topCriticScore : null,
      percentRecommended: percentRecommended > 0 ? percentRecommended : null,
      numReviews: numReviews > 0 ? numReviews : null,
      numTopCriticReviews: numTopCriticReviews
    },
    _.negate(_.identity)
  );
};

/**
 * Fetch information about a game.
 *
 * @param {string} title Game title
 * @returns returns `null` if no game is found that matches the title.
 */
export const getGameInformation = async title => {
  logger.info('opencritic api', 'fetch game information', { title });

  const gameId = await fetchGameId(title);

  return gameId != null ? fetchGameDetails(gameId) : null;
};

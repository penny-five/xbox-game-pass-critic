import * as microsoftApi from '../api/microsoft';
import * as opencriticApi from '../api/opencritic';
import { sleep } from '../utils';
import * as cache from '../games-cache';

/**
 * @type {import('aws-lambda').APIGatewayProxyHandler}
 */
export default async () => {
  const gamesWithoutScores = await microsoftApi.fetchAllGames();
  const gamesWithScores = [];

  for (const game of gamesWithoutScores) {
    const scores = await opencriticApi.getGameInformation(game.title);
    gamesWithScores.push({ ...game, ...scores });
    await sleep(300); // Avoid rate-limiting
  }

  await cache.replaceAll(gamesWithScores);
};

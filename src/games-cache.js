import * as AWS from 'aws-sdk';
import * as _ from 'lodash';

import * as logger from './logger';

const dynamo = new AWS.DynamoDB.DocumentClient();

/**
 * Clears entire cache.
 */
export const clearAll = async () => {
  logger.info('cache', 'clearing cache');

  const games = await getGames();

  const chunks = _.chunk(games, 25);

  for (const chunk of chunks) {
    const params = {
      RequestItems: {
        [process.env.GAMES_TABLE]: chunk.map(game => ({
          DeleteRequest: {
            Key: {
              id: game.id
            }
          }
        }))
      }
    };
    await dynamo.batchWrite(params).promise();
  }

  logger.info('cache', 'cache cleared');
};

/**
 * Get all cached games.
 */
export const getAll = async (destArray = [], lastEvaluatedKey) => {
  logger.info('cache', 'fetching games from cache');

  const output = await dynamo
    .scan({
      TableName: process.env.GAMES_TABLE,
      ExclusiveStartKey: lastEvaluatedKey
    })
    .promise();

  destArray.push(...output.Items);

  if (output.LastEvaluatedKey != null) {
    return getAll(destArray, output.LastEvaluatedKey);
  }

  return destArray;
};

/**
 * Put games to cache.
 *
 * This clears cache of all existing items.
 *
 * @param {any[]} games
 */
export const replaceAll = async games => {
  logger.info('cache', 'putting games to cache', { count: games.length });

  await clearGames();

  const chunks = _.chunk(games, 25);

  for (const chunk of chunks) {
    const params = {
      RequestItems: {
        [process.env.GAMES_TABLE]: chunk.map(game => ({
          PutRequest: {
            Item: game
          }
        }))
      }
    };
    await dynamo.batchWrite(params).promise();
  }
};

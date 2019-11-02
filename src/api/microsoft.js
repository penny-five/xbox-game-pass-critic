import got from 'got';
import * as _ from 'lodash';

import * as logger from '../logger';
import { sleep } from '../utils';

const RECO_API_BASE_URL = 'https://reco-public.rec.mp.microsoft.com/channels/Reco/v8.0';
const CATALOG_API_BASE_URL = 'https://displaycatalog.mp.microsoft.com/v7.0';
const MARKET_AREA = 'FI';

/**
 * Consumes all items from paginated Reco API endpoint.
 *
 * @param {string} endpointUrl
 * @param {any} baseQuery
 */
const consumePaginatedRecoApiEndpoint = async ({ endpointUrl, baseQuery }) => {
  const GAMES_PER_PAGE = 100;

  const fetchPage = async page => {
    const response = await got.get(endpointUrl, {
      json: true,
      baseUrl: RECO_API_BASE_URL,
      query: {
        ...baseQuery,
        market: MARKET_AREA,
        language: 'EN',
        count: GAMES_PER_PAGE,
        skipItems: page * GAMES_PER_PAGE
      }
    });

    return {
      items: response.body.Items,
      numPages: Math.ceil(response.body.PagingInfo.TotalItems / GAMES_PER_PAGE)
    };
  };

  const items = [];
  let currentPage = 0;

  while (true) {
    const result = await fetchPage(currentPage);

    items.push(...result.items);

    if (result.numPages > currentPage + 1) {
      currentPage += 1;
      await sleep(2000);
    } else {
      break;
    }
  }

  return items;
};

/**
 *
 * Fetch all console game ids.
 *
 * @param {number} page
 */
const fetchAllConsoleGameIds = async () => {
  const items = await consumePaginatedRecoApiEndpoint({
    endpointUrl: 'lists/collection/SubsXGPAllGames',
    baseQuery: {
      itemTypes: 'Game',
      DeviceFamily: 'Windows.Xbox'
    }
  });

  return items.map(item => item.Id);
};

/**
 *
 * Fetch all console game ids.
 *
 * @param {number} page
 */
const fetchAllPcGameIds = async () => {
  const items = await consumePaginatedRecoApiEndpoint({
    endpointUrl: 'lists/collection/pcgaVTaz',
    baseQuery: {
      itemTypes: 'Devices',
      DeviceFamily: 'Windows.Desktop'
    }
  });

  return items.map(item => item.Id);
};

/**
 * Fetch game details for provided game ids.
 *
 * @param {any[]} ids
 */
const batchFetchGameDetails = async ids => {
  const response = await got.get('products', {
    json: true,
    baseUrl: CATALOG_API_BASE_URL,
    query: {
      itemTypes: 'Game',
      market: MARKET_AREA,
      'MS-CV': 'DGU1mcuYo0WMMp+F.1',
      languages: 'en-us',
      bigIds: ids.join(',')
    }
  });

  return response.body.Products.map(product => ({
    id: product.ProductId,
    title: product.LocalizedProperties[0].ProductTitle,
    developer: product.LocalizedProperties[0].DeveloperName,
    publisher: product.LocalizedProperties[0].PublisherName,
    website: product.LocalizedProperties[0].PublisherWebsiteUri,
    description: product.LocalizedProperties[0].ShortDescription,
    categories: product.Properties.Categories,
    images: product.LocalizedProperties[0].Images.map(image => ({
      url: `http:${image.Uri}`,
      type: image.ImagePurpose
    }))
  })).map(item => _.omitBy(item, _.negate(_.identity)));
};

/**
 * Fetch all available games.
 */
export const fetchAllGames = async () => {
  logger.info('microsoft api', 'fetch all games');

  const pcGameIds = await fetchAllPcGameIds();
  logger.info('microsoft api', 'received pc games', { count: pcGameIds.length, ids: pcGameIds });
  const consoleGameIds = await fetchAllConsoleGameIds();
  logger.info('microsoft api', 'received console games', { count: consoleGameIds.length, ids: consoleGameIds });

  const gameIds = _.uniq([...pcGameIds, ...consoleGameIds]);
  logger.info('microsoft api', 'fetching details for unique games', { count: gameIds.length, ids: gameIds });

  const games = [];

  while (gameIds.length > 0) {
    const ids = gameIds.splice(0, 20);

    logger.info('microsoft api', 'batch fetch game ids', { ids });

    const results = await batchFetchGameDetails(ids);

    games.push(
      ...results.map(game => ({
        ...game,
        availableOnConsole: consoleGameIds.includes(game.id),
        availableOnPC: pcGameIds.includes(game.id)
      }))
    );

    await sleep(2000);
  }

  return games;
};

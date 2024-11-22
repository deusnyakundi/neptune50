const { Client } = require('@elastic/elasticsearch');
const config = require('../config');
const logger = require('../utils/logger');

class SearchService {
  constructor() {
    this.client = new Client({
      node: config.elasticsearch.url,
      auth: {
        username: config.elasticsearch.username,
        password: config.elasticsearch.password,
      },
    });
  }

  async indexProject(project) {
    try {
      await this.client.index({
        index: 'projects',
        id: project.id.toString(),
        document: {
          id: project.id,
          description: project.description,
          region: project.region,
          msp: project.msp,
          partner: project.partner,
          status: project.status,
          engineer: project.engineer,
          created_at: project.created_at,
          updated_at: project.updated_at,
        },
      });
    } catch (error) {
      logger.error('Error indexing project:', error);
    }
  }

  async searchProjects(query) {
    try {
      const { body } = await this.client.search({
        index: 'projects',
        body: {
          query: {
            bool: {
              must: [
                query.search ? {
                  multi_match: {
                    query: query.search,
                    fields: ['description^2', 'msp', 'partner', 'engineer'],
                    fuzziness: 'AUTO',
                  },
                } : { match_all: {} },
                ...this.buildFilters(query),
              ],
            },
          },
          sort: this.buildSort(query),
          from: (query.page - 1) * query.limit,
          size: query.limit,
          aggs: {
            status_counts: {
              terms: { field: 'status.keyword' },
            },
            region_counts: {
              terms: { field: 'region.keyword' },
            },
          },
        },
      });

      return this.formatSearchResults(body);
    } catch (error) {
      logger.error('Error searching projects:', error);
      throw error;
    }
  }

  buildFilters(query) {
    const filters = [];

    if (query.status) {
      filters.push({ term: { 'status.keyword': query.status } });
    }

    if (query.region) {
      filters.push({ term: { 'region.keyword': query.region } });
    }

    if (query.dateRange) {
      filters.push({
        range: {
          created_at: {
            gte: query.dateRange.start,
            lte: query.dateRange.end,
          },
        },
      });
    }

    return filters;
  }

  buildSort(query) {
    const sort = [];

    if (query.sortBy) {
      sort.push({
        [query.sortBy]: {
          order: query.sortOrder || 'desc',
        },
      });
    } else {
      sort.push({ created_at: { order: 'desc' } });
    }

    return sort;
  }

  formatSearchResults(body) {
    return {
      hits: body.hits.hits.map(hit => ({
        ...hit._source,
        score: hit._score,
      })),
      total: body.hits.total.value,
      aggregations: {
        status: body.aggregations.status_counts.buckets,
        region: body.aggregations.region_counts.buckets,
      },
    };
  }
}

module.exports = new SearchService(); 
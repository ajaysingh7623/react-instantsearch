import connect from '../connectInfiniteHits';

jest.mock('../../core/createConnector', () => x => x);

describe('connectInfiniteHits', () => {
  describe('single index', () => {
    const contextValue = {
      mainTargetedIndex: 'index',
    };

    it('provides the current hits to the component', () => {
      const hits = [{}];
      const props = connect.getProvidedProps.call({}, { contextValue }, null, {
        results: { hits, page: 0, hitsPerPage: 2, nbPages: 3 },
      });

      expect(props).toEqual({
        hits: hits.map(hit => expect.objectContaining(hit)),
        hasMore: true,
      });
    });

    it('accumulate hits internally', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];
      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: { hits, page: 0, hitsPerPage: 2, nbPages: 3 },
        }
      );

      expect(res1.hits).toEqual(hits.map(hit => expect.objectContaining(hit)));
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits2,
            page: 1,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map(hit => expect.objectContaining(hit))
      );
      expect(res2.hasMore).toBe(true);
    });

    it('accumulate hits internally while changing hitsPerPage configuration', () => {
      const hits = [{}, {}, {}, {}, {}, {}];
      const hits2 = [{}, {}, {}, {}, {}, {}];
      const hits3 = [{}, {}, {}, {}, {}, {}, {}, {}];
      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits,
            page: 0,
            hitsPerPage: 6,
            nbPages: 10,
            queryID: 'theQueryID_0',
          },
        }
      );

      expect(res1.hits).toEqual(hits.map(hit => expect.objectContaining(hit)));
      expect(res1.hits.map(hit => hit.__position)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(res1.hits.map(hit => hit.__queryID)).toEqual([
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
      ]);
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits2,
            page: 1,
            hitsPerPage: 6,
            nbPages: 10,
            queryID: 'theQueryID_1',
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map(hit => expect.objectContaining(hit))
      );
      expect(res2.hits.map(hit => hit.__position)).toEqual([
        // page 0
        1,
        2,
        3,
        4,
        5,
        6,
        // page 1
        7,
        8,
        9,
        10,
        11,
        12,
      ]);
      expect(res2.hits.map(hit => hit.__queryID)).toEqual([
        // page 0
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        // page 1
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
      ]);
      expect(res2.hasMore).toBe(true);

      let res3 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits3,
            page: 2,
            hitsPerPage: 8,
            nbPages: 10,
            queryID: 'theQueryID_2',
          },
        }
      );

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map(hit => expect.objectContaining(hit))
      );
      expect(res3.hits.map(hit => hit.__position)).toEqual([
        // page: 0, hitsPerPage: 6
        1,
        2,
        3,
        4,
        5,
        6,
        // page: 1, hitsPerPage: 6
        7,
        8,
        9,
        10,
        11,
        12,
        // hitsPerPage changed from 6 to 8, elements 13-16 are skipped
        // page: 2, hitsPerPage: 8
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
      ]);
      expect(res3.hits.map(hit => hit.__queryID)).toEqual([
        // page 0
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        // page 1
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        // page 2
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
      ]);
      expect(res3.hasMore).toBe(true);

      // re-render with the same property
      res3 = connect.getProvidedProps.call(instance, { contextValue }, null, {
        results: {
          hits: hits3,
          page: 2,
          hitsPerPage: 8,
          nbPages: 10,
          queryID: 'theQueryID_2_',
        },
      });

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map(hit => expect.objectContaining(hit))
      );
      expect(res3.hits.map(hit => hit.__position)).toEqual([
        // page: 0, hitsPerPage: 6
        1,
        2,
        3,
        4,
        5,
        6,
        // page: 1, hitsPerPage: 6
        7,
        8,
        9,
        10,
        11,
        12,
        // hitsPerPage changed from 6 to 8, elements 13-16 are skipped
        // page: 2, hitsPerPage: 8
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
      ]);
      expect(res3.hits.map(hit => hit.__queryID)).toEqual([
        // page 0
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        // page 1
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        // page 2
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
      ]);
      expect(res3.hasMore).toBe(true);
    });

    it('should not reset while accumulating results', () => {
      const hits = [{}, {}];
      const nbPages = 5;
      const instance = {};

      let allHits = [];
      for (let page = 0; page < nbPages - 1; page++) {
        allHits = [...allHits, ...hits];

        const res = connect.getProvidedProps.call(
          instance,
          { contextValue },
          null,
          {
            results: {
              hits,
              page,
              hitsPerPage: hits.length,
              nbPages,
              queryID: `theQueryID_${page}`,
            },
          }
        );

        expect(res.hits).toEqual(
          allHits.map(hit => expect.objectContaining(hit))
        );
        expect(res.hits).toHaveLength((page + 1) * 2);
        expect(res.hasMore).toBe(true);
      }

      allHits = [...allHits, ...hits];

      const res = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits,
            page: nbPages - 1,
            hitsPerPage: hits.length,
            nbPages,
            queryID: `theQueryID_${nbPages - 1}`,
          },
        }
      );

      expect(res.hits).toHaveLength(nbPages * 2);
      expect(res.hits).toEqual(
        allHits.map(hit => expect.objectContaining(hit))
      );
      expect(res.hits.map(hit => hit.__position)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
      ]);
      expect(res.hits.map(hit => hit.__queryID)).toEqual([
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_3',
        'theQueryID_3',
        'theQueryID_4',
        'theQueryID_4',
      ]);
      expect(res.hasMore).toBe(false);
    });

    it('Indicates the last page after several pages', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];
      const hits3 = [{}];
      const instance = {};

      connect.getProvidedProps.call(instance, { contextValue }, null, {
        results: { hits, page: 0, hitsPerPage: 2, nbPages: 3 },
      });

      connect.getProvidedProps.call(instance, { contextValue }, null, {
        results: {
          hits: hits2,
          page: 1,
          hitsPerPage: 2,
          nbPages: 3,
        },
      });

      const props = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits3,
            page: 2,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      expect(props.hits).toEqual(
        [...hits, ...hits2, ...hits3].map(hit => expect.objectContaining(hit))
      );
      expect(props.hasMore).toBe(false);
    });

    it('adds 1 to page when calling refine', () => {
      const props = { contextValue };
      const state0 = {};

      const state1 = connect.refine.call({}, props, state0);
      expect(state1).toEqual({ page: 2 });

      const state2 = connect.refine.call({}, props, state1);
      expect(state2).toEqual({ page: 3 });
    });

    it('automatically converts String state to Number', () => {
      const props = { contextValue };
      const state0 = { page: '0' };

      const state1 = connect.refine.call({}, props, state0);
      expect(state1).toEqual({ page: 1 });
    });

    it('expect to always return an array of hits', () => {
      const props = { contextValue };
      const searchState = {};

      // Retrieve the results from the cache that's why
      // the page it's not zero on the first render
      const searchResults = {
        results: {
          hits: [{}, {}, {}],
          hitsPerPage: 3,
          page: 1,
          nbPages: 3,
        },
      };

      const expectation = {
        hits: [{}, {}, {}].map(hit => expect.objectContaining(hit)),
        hasMore: true,
      };

      const actual = connect.getProvidedProps.call(
        {},
        props,
        searchState,
        searchResults
      );

      expect(actual).toEqual(expectation);
    });
  });

  describe('multi index', () => {
    const contextValue = {
      mainTargetedIndex: 'first',
    };
    const indexContextValue = {
      targetedIndex: 'second',
    };

    it('provides the current hits to the component', () => {
      const hits = [{}];
      const props = connect.getProvidedProps.call(
        {},
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 2, nbPages: 3 } },
        }
      );

      expect(props).toEqual({
        hits: hits.map(hit => expect.objectContaining(hit)),
        hasMore: true,
      });
    });

    it('accumulate hits internally', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];

      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 2, nbPages: 3 } },
        }
      );

      expect(res1.hits).toEqual(hits.map(hit => expect.objectContaining(hit)));
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits2, page: 1, hitsPerPage: 2, nbPages: 3 },
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map(hit => expect.objectContaining(hit))
      );
      expect(res2.hasMore).toBe(true);
    });

    it('accumulate hits internally while changing hitsPerPage configuration', () => {
      const hits = [{}, {}, {}, {}, {}, {}];
      const hits2 = [{}, {}, {}, {}, {}, {}];
      const hits3 = [{}, {}, {}, {}, {}, {}, {}, {}];
      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 6, nbPages: 10 } },
        }
      );

      expect(res1.hits).toEqual(hits.map(hit => expect.objectContaining(hit)));
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits2, page: 1, hitsPerPage: 6, nbPages: 10 },
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map(hit => expect.objectContaining(hit))
      );
      expect(res2.hasMore).toBe(true);

      let res3 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits3, page: 2, hitsPerPage: 8, nbPages: 10 },
          },
        }
      );

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map(hit => expect.objectContaining(hit))
      );
      expect(res3.hasMore).toBe(true);

      // re-render with the same property
      res3 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits3, page: 2, hitsPerPage: 8, nbPages: 10 },
          },
        }
      );

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map(hit => expect.objectContaining(hit))
      );
      expect(res3.hasMore).toBe(true);
    });

    it('should not reset while accumulating results', () => {
      const hits = [{}, {}];
      const nbPages = 100;
      const instance = {};

      let allHits = [];
      for (let page = 0; page < nbPages - 1; page++) {
        allHits = [...allHits, ...hits];

        const res = connect.getProvidedProps.call(
          instance,
          { contextValue, indexContextValue },
          null,
          {
            results: {
              second: {
                hits,
                page,
                hitsPerPage: hits.length,
                nbPages,
              },
            },
          }
        );

        expect(res.hits).toEqual(
          allHits.map(hit => expect.objectContaining(hit))
        );
        expect(res.hits).toHaveLength((page + 1) * 2);
        expect(res.hasMore).toBe(true);
      }

      allHits = [...allHits, ...hits];

      const res = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits,
              page: nbPages - 1,
              hitsPerPage: hits.length,
              nbPages,
            },
          },
        }
      );

      expect(res.hits).toHaveLength(nbPages * 2);
      expect(res.hits).toEqual(
        allHits.map(hit => expect.objectContaining(hit))
      );
      expect(res.hasMore).toBe(false);
    });

    it('Indicates the last page after several pages', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];
      const hits3 = [{}];
      const instance = {};

      connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 2, nbPages: 3 } },
        }
      );

      connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits2, page: 1, hitsPerPage: 2, nbPages: 3 },
          },
        }
      );

      const props = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits3, page: 2, hitsPerPage: 2, nbPages: 3 },
          },
        }
      );

      expect(props.hits).toEqual(
        [...hits, ...hits2, ...hits3].map(hit => expect.objectContaining(hit))
      );
      expect(props.hasMore).toBe(false);
    });
  });
});

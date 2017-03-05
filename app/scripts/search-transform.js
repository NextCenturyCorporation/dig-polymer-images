/*
 * Copyright 2017 Next Century Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* exported searchTransform */
/* jshint camelcase:false */

var searchTransform = (function(_) {
  function getPredicate(type) {
    switch(type) {
      case 'age': return 'age';
      case 'city': return 'city';
      case 'country': return 'country';
      case 'description': return 'description';
      case 'email': return 'email';
      case 'ethnicity': return 'ethnicity';
      case 'eyeColor': return 'eye';
      case 'gender': return 'gender';
      case 'hairColor': return 'hair';
      case 'height': return 'height';
      case 'image': return '';
      case 'name': return 'name';
      case 'phone': return 'phone';
      case 'price': return 'price';
      case 'region': return 'state';
      case 'services': return 'service';
      case 'title': return 'title';
      case 'website': return 'tld';
      case 'weight': return 'weight';
    }
  }

  return {
    result: function(response) {
      if(response && response.length && response[0].result) {
        return response[0].result;
      }
      return {};
    },

    search: function(page, pageSize, searchParameters) {
      var clauses = [];
      var filters = [];
      var groupBy;

      if(!_.isEmpty(searchParameters)) {
        _.keys(searchParameters).forEach(function(type) {
          var predicate = getPredicate(type);
          _.keys(searchParameters[type]).forEach(function(term) {
            if(searchParameters[type][term].enabled) {
              if(type === 'postingDate') {
                // TODO Add to filters
              } else {
                clauses.push({
                  constraint: searchParameters[type][term].key,
                  isOptional: true,
                  predicate: predicate
                });
              }
            }
          });
        });

        groupBy = (!page || !pageSize) ? undefined : {
          limit: pageSize,
          offset: (page - 1) * pageSize
        };
      }

      return {
        SPARQL: {
          'group-by': groupBy,
          select: {
            variables: [{
              type: 'simple',
              variable: '?doc_id'
            }, {
              type: 'simple',
              variable: '?fields'
            }, {
              type: 'simple',
              variable: '?tld'
            }, {
              type: 'simple',
              variable: '?url'
            }]
          },
          where: {
            clauses: clauses,
            filters: filters,
            type: 'Ad',
            variable: '?ad'
          }
        },
        type: 'Point Fact'
      };
    }
  };
});


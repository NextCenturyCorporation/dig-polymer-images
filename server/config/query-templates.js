'use strict';

module.exports = {

  QUERY_TEMPLATES: {
    // Common query used among entities
    commonMatchQuery: {
        query:{
            match:{ '{{field}}' : '{{value}}' }
        }
    },
    // phone/email page specific queries
    phoneOrEmailOfferAgg: {
        query: {
          filtered:{
            query:{
                match:{ '{{field}}' : '{{value}}' }
            }
          }
        },
        'aggs' : {
            // When: Timeline of offers
            'offers_by_date': {
                'date_histogram': {
                    'field': 'validFrom',
                    'interval': 'week'
                }
            },
            // Where: Map showing offers by location
            'offers_by_city': {
                'terms': {
                    'field': 'availableAtOrFrom.address.addressLocality',
                    'size': 0
                }
            }
        }
    },
    // Who: Give a sense of who is using this phone/email
    // note that in current index, aggregations on hair color, eye color, and ethnicity come back empty
    // and that ethnicity is missing from offer type
    phoneOrEmailPeopleAgg: {
        "query": {
            "match": {
                "{{field}}": "{{value}}"
            }
        },
        "aggs" : {
            "people_names": {
                "terms": {
                    "field": "name",
                    "size": 0
                }
            },
            "people_ages": {
                "terms": {
                    "field": "age",
                    "size": 0
                }
            },
            "people_ethnicities": {
                "terms": {
                    "field": "ethnicity",
                    "size": 0
                }
            }
        }
    },
    // Relations
    phoneOrEmailSellerAgg: {
        "query": {
            "match": {
                "{{field}}": "{{value}}"
            }   
        },
        "aggs" : {
            "related_phones" : {
                "terms" : { 
                    "field" : "telephone.name",
                    "size": 0
                },
                "aggs" : {
                    // Timeline similarities
                    "related_phone_timelines": {
                        "date_histogram": {
                            "field": "makesOffer.validFrom",
                            "interval": "week"
                        }
                    } 
                }   
            },
            "related_emails" : {
                "terms" : { 
                    "field" : "email.name",
                    "size": 0
                }          
            },
            "related_websites" : {
                "terms" : { 
                    "field" : "makesOffer.mainEntityOfPage.publisher.name",
                    "size": 0
                }          
            }
        }
    },
    // offer page queries
    // not being used yet on offer
    offerSellerAgg: {
        "query": {
            "match": {
                "{{field}}": "{{value}}"
            }   
        },
        "aggs": {
            "offers_by_seller" : {
                "date_histogram": {
                    "field": "validFrom",
                    "interval": "week"
                }     
            },
            "offer_locs_by_seller" : {
                "terms" : { 
                    "field" : "availableAtOrFrom.address.addressLocality",
                    "size": 0
                }      
            }        
        }
    },
    relatedPhonesOrEmails: {
        query: {
            "query" : {
                "filtered" : {
                    "filter" : {
                        "terms" : { 
                            "name": []
                        }
                    }
                }
            }
        },
        pathToValueRelativeToQuery: 'query.filtered.filter.terms.name'
    },
    offerRelatedEntities: {
        query: {
            "query": {
                "bool": {
                    "should":   [{
                        "filtered" : {
                            "filter" : {
                                "terms" : {
                                    "phone.name": []
                                }
                            }
                        }
                    },{
                        "filtered" : {
                            "filter" : {
                                "terms" : {
                                    "email.name": []
                                }
                            }
                        }
                    },{
                        "match": {
                            "_id": ""
                        }
                    },{
                        "match": {
                            "_id": ""
                        }
                    },{
                        "match": {
                            "_id": ""
                        }
                    }]
                }
            }
        },
        pathsToValues: [
            'query.bool.should[0].filtered.filter.terms["phone.name"]', 
            'query.bool.should[1].filtered.filter.terms["email.name"]',
            'query.bool.should[2].match._id',
            'query.bool.should[3].match._id',
            'query.bool.should[4].match._id'
        ]
    },
    // seller entity queries
    // phone and email aggregations might be able to be performed together when
    // entity resolution is done on seller
    sellerPhoneAggs: {
        "query": {
            "filtered": {
                "filter": {
                    "term": {
                        '{{field}}' : '{{value}}'
                    }
                }
            }
        },
        "aggs":{
            "seller_assoc_numbers": {
                "terms": {
                    "field": "telephone.name",
                    "size": 0
                }
            }
        }
    },
    sellerEmailAggs: {
        "query": {
            "filtered": {
                "filter": {
                    "term": {
                        '{{field}}' : '{{value}}'
                    }
                }
            }
        },
        "aggs":{
            "seller_assoc_emails": {
                "terms": {
                    "field" : "email.name",
                    "size": 0
                }
            }
        }
    },
    // same one used in phone/email
    sellerPeopleAggs: {
        "query": {
            "filtered": {
                "filter": {
                    "term": {
                        "{{field}}": "{{value}}"
                    }
                }
            }
        },
        "aggs" : {
            "people_names": {
                "terms": {
                    "field": "name",
                    "size": 0
                }
            },
            "people_ages": {
                "terms": {
                    "field": "personAge",
                    "size": 0
                }
            },
            "people_ethnicities": {
                "terms": {
                    "field": "ethnicity",
                    "size": 0
                }
            },
            "people_eye_colors": {
                "terms": {
                    "field": "eyeColor",
                    "size": 0
                }
            },
            "people_hair_color": {
                "terms": {
                    "field": "hairColor",
                    "size": 0
                }
            }
        }
    },
    sellerPeopleAndOffers: {
        query: {
            "query": {
                "bool": {
                    "should":  [{
                        "match": {
                            "offer.seller.uri": ""
                        }
                    },{
                        "match": {
                            "adultservice.offers.seller.uri": ""
                        }
                    }]
                }
            }
        },
        pathsToValues: [
            'query.bool.should[0].match["offer.seller.uri"]', 
            'query.bool.should[1].match["adultservice.offers.seller.uri"]'
        ]
    },
    // TODO: reorganize queries -- duplicate of offerSellerAgg
    offerAggsBySeller: {
        "query": {
            "match": {
                '{{field}}' : '{{value}}'
            }   
        },
        "aggs": {
            "offers_by_seller" : {
                "date_histogram": {
                    "field": "validFrom",
                    "interval": "week"
                }
            },
            "offer_locs_by_seller" : {
                "terms" : { 
                    "field" : "availableAtOrFrom.address.addressLocality",
                    "size": 0
                }
            }
        }
    },
    // webpage entity queries
    webpageRevisions: {
        "query": {
            "filtered": {
                "filter": {
                    "term": {
                        '{{field}}' : '{{value}}'
                    }
                }
            }
        },
        "aggs": {
            "page_revisions" : {
                "date_histogram": {
                    "field": "dateCreated",
                    "interval": "week"
                }
            }
        }
    },
    // person entity queries
    // same agg is done under seller
    personRelatedPhones: {
        query: {
            "query": {
                "filtered": {
                    "filter": {
                        "terms": {
                            "telephone.name": []
                        }
                    }
                }
            },
            "aggs":{
                "assoc_numbers": {
                    "terms": {
                        "field": "telephone.name",
                        "size": 0
                    }
                }
            }
        },
        pathToValueRelativeToQuery: 'query.filtered.filter.terms["telephone.name"]'
    },
    personRelatedEmails: {
        query: {
            "query": {
                "filtered": {
                    "filter": {
                        "terms": {
                            "email.name": []
                        }
                    }
                }
            },
            "aggs":{
                "assoc_emails": {
                    "terms": {
                        "field": "email.name",
                        "size": 0
                    }
                }
            }
        },
        pathToValueRelativeToQuery: 'query.filtered.filter.terms["email.name"]'
    },
    // used on other entity views as well (w/different aggregation names)
    personOfferAgg: {
        "query": {
            "filtered": {
                "filter": {
                    "term": {
                        '{{field}}' : '{{value}}'
                    }
                }
            }
        },
        size: 40, // TODO: add paging
        "aggs": {
            "offers_with_person" : {
                "date_histogram": {
                    "field": "validFrom",
                    "interval": "week"
                }
            },
            "locs_for_person" : {
                "terms" : {
                    "field" : "availableAtOrFrom.address.addressLocality",
                    "size": 0
                }
            },
            // adding to get aggregate of all phones and emails
            "phones_for_person": {
                "terms" : {
                    "field" : "seller.telephone.name",
                    "size": 0
                }
            },
            "emails_for_person": {
                "terms" : {
                    "field" : "seller.email.name",
                    "size": 0
                }
            }
        }
    }
  }
};

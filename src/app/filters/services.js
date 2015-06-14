'use strict';

function filtersService($q, $location, globalSettings, utilsFactory, resultsService, categoriesService) {

    var self = this,
        activeFiltersModel = {
            categories:     [],
            themes:         [],
            districts:      [],
            cities:         [],
            structure:      [],
            search:         null
        };

    // Define all type of filters that needs an interval check instead of an id one
    var filtersByInterval = ['difficulty', 'duration', 'ascent', 'eLength'];

    self.initFilters = function () {
        var deferred = $q.defer(),
            promises = [];
 
        if (!self.filters) {
            self.filters = angular.copy(activeFiltersModel);
        }

        promises.push(
            categoriesService.getCategories()
                .then(
                    function (categories) {
                        self.InitCategoriesFilters(categories);
                    },
                    function (err) {
                        console.error(err);
                    }
                )
        );

        promises.push(
            resultsService.getAllResults()
                .then(
                    function (results) {
                        self.initGlobalFilters(results);
                    },
                    function (err) {
                        console.error(err);
                    }
                )
        );

        $q.all(promises)
            .then(
                function () {
                    self.initActiveFilter();
                    deferred.resolve(self.filters);
                },
                function (err) {
                    console.error(err);
                }
            );
 
        return deferred.promise;
    };

    self.InitCategoriesFilters = function (categories) {

        angular.forEach(categories, function (category) {
            if (globalSettings.LIST_EXCLUDE_CATEGORIES.indexOf(category.id.toString()) === -1) {
                var newCategory = {
                    label: category.label,
                    id: category.id,
                    type1: [],
                    type2: []
                };

                if (category.type1 && category.type1.values.length > 0) {
                    newCategory.type1 = category.type1;
                }

                if (category.type2 && category.type2.values.length > 0) {
                    newCategory.type2 = category.type2;
                }

                if (category.type === 'treks') {
                    newCategory.difficulty = [];
                    if (category.difficulty.values.length > 0) {
                        newCategory.difficulty = category.difficulty;
                    }
                    if (category.route.values.length > 0) {
                        newCategory.route = category.route;
                    }
                    newCategory.duration = category.duration;
                    newCategory.ascent = category.ascent;
                    newCategory.eLength = category.eLength;
                }

                self.filters.categories.push(newCategory);

                if (typeof globalSettings.DEFAULT_ACTIVE_CATEGORIES !== 'object') {
                    globalSettings.DEFAULT_ACTIVE_CATEGORIES = [globalSettings.DEFAULT_ACTIVE_CATEGORIES];
                }
 
                if (globalSettings.DEFAULT_ACTIVE_CATEGORIES.indexOf(category.id.toString()) > -1) {
                    activeFiltersModel.categories.push(category.id);
                }
            }
        });

    };

    self.initGlobalFilters = function (results) {

        if (results) {
            angular.forEach(results, function (result) {
                self.addPropertyToFilters(result.properties.themes, 'themes');
                self.addPropertyToFilters(result.properties.districts, 'districts');
                self.addPropertyToFilters(result.properties.cities, 'cities');
                self.addPropertyToFilters(result.properties.structure, 'structure');

            });
        }

        return self.filters;

    };

    self.addPropertyToFilters = function (property, propertyName) {
        if (property) {
            if (typeof property !== 'object') {
                property = [property];
            }

            if (property.length > 0) {
                angular.forEach(property, function (value) {
                    if (!(utilsFactory.idIsInArray(self.filters[propertyName], value)) && value !== undefined) {
                        return self.filters[propertyName].push(value);
                    }
                });
            }
        }
 
        return false;
    };

    self.getFilters = function () {
        return self.filters;
    };




    // Active FIlters
    //

    self.initActiveFilter = function (forceRefresh) {
        
        if (!self.activeFilters || forceRefresh) {
            self.activeFilters = angular.copy(activeFiltersModel);
            if (angular.equals($location.search(), {})) {
                $location.search(self.activeFilters);
            } else {
                self.updateActiveFiltersFromUrl();
            }
        }
    };

    self.resetActiveFilters = function () {
        $location.search({});
        self.initActiveFilter(true);
    };

    self.filtersChanged = function (filters) {
        return !angular.equals(filters, self.activeFilters);
    };

    self.updateActiveFilters = function (activeFilters) {
        if (activeFilters.search === '') {
            activeFilters.search = null;
        }
        self.activeFilters = activeFilters;
        $location.search(activeFilters);
    };

    self.updateActiveFiltersFromUrl = function () {
        var urlFilters = $location.search();

        angular.forEach(urlFilters, function (filterValues, filterName) {
            self.addFilterValueToActiveFilters(filterValues, filterName);
        });
        return self.activeFilters;
    };

    self.addFilterValueToActiveFilters = function (filterValues, filterName) {
        if (!self.activeFilters[filterName]) {
            self.activeFilters[filterName] = [];
        }

        if (typeof filterValues === 'string') {
            filterValues = [filterValues];
        }

        angular.forEach(filterValues, function (filterId) {
            if (self.activeFilters[filterName].indexOf(filterId) === -1) {
                self.activeFilters[filterName].push(filterId);
            }
        });
    };

    self.getActiveFilters = function () {
        return self.activeFilters;
    };






    // Tag Filters
    //

    self.getATagFilter = function (id, type, subtype, subId) {
        var filter = null;
        if (type === 'search') {
            filter = {
                id: id,
                label: id
            };
        } else {
            var filters = self.getFilters();

            angular.forEach(filters[type], function (currentFilter) {
                if (!subtype) {
                    if ((currentFilter.id && currentFilter.id.toString() === id.toString()) || (currentFilter.code && currentFilter.code.toString() === id.toString())) {
                        filter = currentFilter;
                    }
                } else {

                    if (subId.indexOf('-') > -1 && currentFilter[subtype]) {
                        var min = subId.split('-')[0],
                            max = subId.split('-')[1],
                            minFilter = null,
                            maxFilter = null;

                        angular.forEach(currentFilter[subtype].values, function (currentSubFilter) {
                            if (currentSubFilter.id.toString() === min.toString()) {
                                minFilter = currentSubFilter;
                            }
                            if (currentSubFilter.id.toString() === max.toString()) {
                                maxFilter = currentSubFilter;
                            }
                        });

                        if (minFilter && maxFilter) {
                            filter = {id: subId};
                            if (minFilter.id.toString() === maxFilter.id.toString()) {
                                filter.label = minFilter.label;
                            } else {
                                filter.label = minFilter.label + ' -> ' + maxFilter.label;
                            }
                        }

                    } else {
                        if (currentFilter.id.toString() === id.toString()) {
                            angular.forEach(currentFilter[subtype].values, function (currentSubFilter) {
                                if (currentSubFilter.id.toString() === subId.toString()) {
                                    filter = currentSubFilter;
                                }
                            });
                        }
                    }
                }
            });
        }

        return filter;
    };

    self.getTagFilters = function (activeFilters) {
        var tagFilters = [];

        angular.forEach(activeFilters, function (aFilter, index) {
            var type = index,
                id = 0,
                subtype = null,
                subId = null;

            if (index.indexOf('_') > -1) {
                type = 'categories';
                id = index.split('_')[0];
                subtype = index.split('_')[1];
            }

            if (typeof aFilter === 'string') {
                aFilter = [aFilter];
            }

            angular.forEach(aFilter, function (aSubFilter) {

                if (subtype) {
                    subId = aSubFilter;
                } else {
                    id = aSubFilter;
                }

                var tempElement = self.getAFilter(id, type, subtype, subId);
                var tagElement = {
                    id: tempElement.id || tempElement.code,
                    label: tempElement.label || tempElement.name,
                    type: type,
                    typeId: id,
                    subtype: subtype,
                    queryLabel: index
                };
                tagFilters.push(tagElement);
            });

        });

        return tagFilters;
    };





    //  Filtering
    //

    self.getFilteredResults = function (forceRefresh) {
        var deferred = $q.defer(),
            filters = self.getActiveFilters();

        resultsService.getAllResults(forceRefresh)
            .then(
                function (results) {
                    self.filteredResults = [];
                    angular.forEach(results, function (result) {
                        if (self.filterElement(result, filters)) {
                            self.filteredResults.push(result);
                        }
                    });
                    deferred.resolve(self.filteredResults);
                }
            );

        return deferred.promise;
    };

    self.filterElement = function (element) {

        // Set Up final test vars
        var categoriesFilter = true,
            themesFilter = true,
            searchFilter = true,
            citiesFilter = true,
            districtsFilter = true,
            structureFilter = true;

        var filters = self.activeFilters;
        
        if (filters.categories.length > 0) {

            if (self.matchById(element.properties.category, filters.categories, 'category')) {

                var subFilters = self.categoryHasSubfilters(element.properties.category.id, filters);

                if (_.size(subFilters) > 0) {
                    var subfiltersResults = [];
                    angular.forEach(subFilters, function (subFilter, subFilterName) {
                        if (filtersByInterval.indexOf(subFilterName) > -1) {
                            subfiltersResults.push(self.matchByRange(element.properties, subFilter, subFilterName));
                        } else {
                            subfiltersResults.push(self.matchById(element.properties, subFilter, subFilterName));
                        }

                    });
                    if (subfiltersResults.indexOf(false) === -1) {
                        categoriesFilter = true;
                    } else {
                        categoriesFilter = false;
                    }

                } else {
                    categoriesFilter = true;
                }

            } else {
                categoriesFilter = false;
            }

        } else {
            categoriesFilter = self.matchById(element, globalSettings.DEFAULT_ACTIVE_CATEGORIES, 'category');
        }

        if (filters.themes.length > 0) {
            themesFilter = self.matchById(element.properties, filters.themes, 'themes');
        }

        if (filters.search) {
            searchFilter = self.testByString(element.properties, filters.search);
        }

        if (filters.cities.length > 0) {
            citiesFilter = self.matchById(element.properties, filters.cities, 'cities');
        }

         if (filters.districts.length > 0) {
            districtsFilter = self.matchById(element.properties, filters.districts, 'districts');
        }

        if (filters.structure.length > 0) {
            structureFilter = self.matchById(element.properties, filters.structure, 'structure');
        }

        // CATEGORY && THEME && QUERY && CITY && DISTRICT
        // Global test that pass if all filters test are true
        return categoriesFilter && themesFilter && searchFilter && citiesFilter && districtsFilter && structureFilter;

    };


    self.matchByRange = function (element, filters, name) {
        var min = filters.toString().split('-')[0],
            max = filters.toString().split('-')[1],
            elementId = element[name].id || element[name];

        if (parseInt(min, 10) <= parseInt(elementId, 10) && parseInt(elementId, 10) <= parseInt(max, 10)) {
            return true;
        }

        return false;
    };

    self.matchById = function (element, filters, name) {
        // $location provide a string if there's only one value, an array if there's more
        if (typeof filters === 'string') {
            return self.testById(element, filters, name);
        } else {
            var result = false;
            angular.forEach(filters, function (filter) {
                // VAL X OR VAL Y
                // We set true for any value that pass
                if (self.testById(element, filter, name)) {
                    result = true;
                }
            });
            return result;
        }
    };

    self.testByString = function (element, query) {

        var result = false;
        element = _.values(element);

        angular.forEach(element, function (property) {
            if (!result) {
                if (typeof property === 'string') {
                    var regex = new RegExp(query, 'gi');
                    if (property.match(regex) !== null) {
                        result = true;
                    }
                } else if (typeof property === 'object') {
                    result = self.testByString(property, query);
                }
            }

        });

        return result;
    };

    self.testById = function (element, filter, filterKey) {
        var result = false,
            currentElement;

        if (!element) {
            return false;
        }
        // Try to find the filter element as a direct child of our element, else test element itself
        if (element[filterKey]) {
            currentElement = element[filterKey];
        } else {
            currentElement = element;
        }

        if ((currentElement.id && currentElement.id.toString() === filter.toString()) || (currentElement.code && currentElement.code.toString() === filter.toString())) {
            result = true;
        } else {
            // If element is an object or an array, we can browse it to find the filter
            if (typeof currentElement === 'object') {
                angular.forEach(currentElement, function (subelement) {
                    if (self.testById(subelement, filter, filterKey)) {
                        result = true;
                    }
                });
            }
        }

        return result;
    };

    self.categoryHasSubfilters = function (elementCategoryId, filters) {
        var catSubFilters = {};

        angular.forEach(filters, function (filter, filterName) {
            // subfilters are composed like catId-subFilterName
            if (filterName.indexOf('_') > -1) {
                var categoryId = filterName.split('_')[0],
                    filterKey = filterName.split('_')[1];

                if (categoryId.toString() === elementCategoryId.toString() && filter.length > 0) {

                    //Init catSubfilters child if it doesn't exists
                    if (!catSubFilters[filterKey]) {
                        catSubFilters[filterKey] = [];
                    }
                    catSubFilters[filterKey] = filter;
                }
            }
        });

        return catSubFilters;
    };

}

module.exports = {
    filtersService : filtersService
};
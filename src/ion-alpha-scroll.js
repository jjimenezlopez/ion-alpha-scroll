angular.module('ion-alpha-scroll', [])
.directive('ionAlphaScroll', [
    '$ionicScrollDelegate', '$location', '$timeout', '$document', '$parse',
    function($ionicScrollDelegate, $location, $timeout, $document, $parse) {
        return {
            require: '?ngModel',
            restrict: 'AE',
            replace: true,
            compile: function(tElement, tAttrs, tTransclude) {
                var children = tElement.contents();
                var template = angular.element([
                    '<ion-list class="ion_alpha_list_outer">',
                    '<ion-scroll delegate-handle="alphaScroll">',
                    '<div class="item item-input" ng-if="showSearchBar">',
                    '<input type="text" name="search" ng-change="search(searchValue)" ng-model="searchValue" value="" placeholder="{{\'Search\' | translate}}">',
                    '</div>',
                    '<div data-ng-repeat="(letter, items) in sorted_items" class="ion_alpha_list">',
                    '<ion-item class="item item-divider" id="index_{{letter}}">{{letter}}</ion-item>',
                    '<ion-item class="item item-avatar" ng-repeat="item in items" ng-click="itemClick(item)"></ion-item>',
                    '</div>',
                    '<div class="item" ng-if="!items.length">',
                    '{{ \'No elements to show\' | translate}}',
                    '</div>',
                    '</ion-scroll>',
                    '<ul class="ion_alpha_sidebar" ng-if="items.length">',
                    '<li ng-click="alphaScrollGoToList(\'index_{{letter}}\')" ng-repeat="letter in alphabet | orderBy: letter">{{ letter }}</li>',
                    '</ul>',
                    '</ion-list>'
                ].join(''));

                var headerHeight = $document[0].body.querySelector('.bar-header').offsetHeight;
                var subHeaderHeight = tAttrs.subheader === "true" ? 44 : 0;
                var tabHeight = $document[0].body.querySelector('.tab-nav') ? $document[0].body.querySelector('.tab-nav').offsetHeight : 0;
                var windowHeight = window.innerHeight;
                var itemClick = $parse(tAttrs.itemClick);
                var contentHeight = windowHeight - headerHeight - subHeaderHeight - tabHeight;

                angular.element(template.find('ion-item')[1]).append(children);
                tElement.html('');
                tElement.append(template);

                tElement.find('ion-scroll').css({
                    "height": contentHeight + 'px'
                });

                return function(scope, element, attrs, ngModel) {
                    var count = 0;
                    var scrollContainer = element.find('ion-scroll');

                    var ionicScroll = scrollContainer.controller('$ionicScroll');

                    // do nothing if the model is not set
                    if (!ngModel) return;

                    ngModel.$render = function() {
                        scope.items = [];
                        scope.items = ngModel.$viewValue;
                        
                        scope.items = scope.items.sort(function (a, b) {
                            var result = 0;
                            
                            if (a[attrs.key].toLowerCase() < b[attrs.key].toLowerCase()) {
                                result = -1;
                            }
                            
                            if (a[attrs.key].toLowerCase() > b[attrs.key].toLowerCase()) {
                                result = 1;
                            }
                                
                            return result;
                        });
                        
                        scope.initialItems = scope.items;
                        scope.showSearchBar = attrs.showSearchBar === "true";
                        scope.itemClick = function (item) {
                            itemClick(scope, {item: item});
                        };
                        
                        prepareList();
                        
                        scope.search = search;

                        //Create alphabet object
                        function iterateAlphabet(alphabet) {
                            var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                            if (Object.keys(alphabet).length != 0) {
                                str = '';
                                for (var i = 0; i < Object.keys(alphabet).length; i++) {
                                    str += Object.keys(alphabet)[i];
                                }
                            }
                            var numbers = new Array();
                            for (var i = 0; i < str.length; i++) {
                                var nextChar = str.charAt(i);
                                numbers.push(nextChar);
                            }
                            return numbers;
                        }

                        function prepareList() {
                            var tmp = {};
                            for (i = 0; i < scope.items.length; i++) {
                                var letter = scope.items[i][attrs.key].toUpperCase().charAt(0);
                                if (tmp[letter] == undefined) {
                                    tmp[letter] = []
                                }
                                tmp[letter].push(scope.items[i]);
                            }
                            scope.alphabet = iterateAlphabet(tmp);
                            scope.sorted_items = tmp;

                            scope.alphaScrollGoToList = function(id) {
                                $location.hash(id);
                                $ionicScrollDelegate.$getByHandle('alphaScroll').anchorScroll();
                            }
                        }
                        
                        function search(value) {
                            if (value.length > 0) {
                                scope.items = scope.initialItems.filter(function (item) {
                                    var valueLowerCase = value.toLowerCase();

                                    return item.displayName.toLowerCase().indexOf(valueLowerCase) > -1;
                                });
                            } else {
                                scope.items = scope.initialItems;
                            }
                            
                            prepareList();
                        }
                    };
                }
            }
        };
    }
]);

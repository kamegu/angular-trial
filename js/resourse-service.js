'use strict';

var resourceService = angular.module('resourceService', ['ngResource']);

resourceService.jsonBase = 'json/';

resourceService.factory('Snapshot', ['$resource', function($resource){
	return $resource(resourceService.jsonBase + 'snapshots/:snapshotName.json', {}, {
		query: {method:'GET', params: {snapshotName: 'snapshots'}, isArray:true}
	});
}]);

resourceService.factory('Table', ['$resource', function($resource){
	return $resource(resourceService.jsonBase + 'tables.json', {}, {
	query: {method:'GET', isArray:true}
	});
}]);

resourceService.factory('Reference', ['$resource', function($resource){
	return $resource(resourceService.jsonBase + 'references.json', {}, {
		query: {method:'GET', isArray:true}
	});
}]);

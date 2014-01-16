'use strict';

/* App Module */

var diagramApp = angular.module('diagramApp', ['resourceService']);

diagramApp.directive('myDraggable', function(){
  return {
    restrict: 'A',
    link : function(scope, element, attrs) {
      var table = scope[attrs.myDraggable];
      table.element = element;
      element.draggable({
        containment: $('#diagram-view'), 
        cursor: "move",
        drag: function(event, ui) {
          table.x = ui.position.left;
          table.y = ui.position.top;
          scope.$apply('tables');
        },
        stop: function(event, ui) {
          table.x = ui.position.left;
          table.y = ui.position.top;
          scope.$apply('tables');
        }
      });
    }
  };
});

diagramApp.factory('ContextMenu', function(){
  var ContextMenu = function(scope) {
    this.tableName = null;
    this.x = null;
    this.y = null;
    this.scope = scope;
  };
  ContextMenu.prototype.openMenu = function(table, event) {
    if (table && table.name) {
      this.tableName = table.name;
      this.x = event.clientX - 5;
      this.y = event.clientY - 5;
    }
    event.stopPropagation();
  };
  ContextMenu.prototype.closeMenu = function(type) {
    if (type === 'remove') {
      var tableName = this.tableName;
      angular.forEach(this.scope.tables, function(table){
        if (table.name == tableName) {
          table.deselect();
        }
      });
    } else if (type === 'edit') {
      alert('not edit page');
    }
    this.tableName = null;
  };
  ContextMenu.prototype.enable = function() {
    return !!this.tableName;
  };
  ContextMenu.prototype.position = function() {
    return {top: this.y, left: this.x};
  };
  return ContextMenu;
});

diagramApp.controller('DiagramCtrl', ['$scope', '$http', '$filter', 'Table','Reference', 'Snapshot', 'ContextMenu', 
  function($scope, $http, $filter, Table, Reference, Snapshot, ContextMenu) {
    $scope.snapshots = [];
    $scope.selectedSnapshot = '';
    $scope.tables = Table.query(function(){
      angular.forEach($scope.tables, function(table){
        table.select = function(options){
          table.selected = true;
          if (options && options.autoIfNull === true) {
            if (!table.x || !table.y) {
              var pos = $('#diagram-view').searchEmptyArea(100, 100);
              table.x = pos.x;
              table.y = pos.y;
            }
          } else if (options && options.pos) {
            table.x = options.pos.x || 10;
            table.y = options.pos.y || 10;
          }
          $scope.selectTableView();
        };
        table.deselect = function() {
          table.selected = false;
          if (table.current) {
            $scope.selectTableView({name: ''});
          }
          table.connected = false;
        };
      });
    });
    $scope.references = Reference.query();

    $scope.clickTableLi = function(table) {
      table.selected = !table.selected;
      if (table.selected) {
        table.select({autoIfNull: true});
      } else {
        table.deselect();
      }
    };
    $scope.searchSelected = function(table) {
      return !!table.selected;
    };

    $scope.loadSelectedSnapshot = function() {
      var name = $scope.selectedSnapshot;
      if (!name) {
        return;
      }
      Snapshot.query({snapshotName: name}, function(data){
        var map = {};
        angular.forEach(data, function(value, key){
          map[value.name] = value;
        });

        angular.forEach($scope.tables, function(table, key){
          var ss = map[table.name];
          if (ss) {
            table.select({pos: ss});
          } else {
            table.deselect();
          }
        });
        $scope.selectTableView({name: ''});
      });
    };

    $scope.viewableReferences = function(){
      var tbls = {};
      angular.forEach($scope.tables, function(table){
        if (table.selected) {
          tbls[table.name] = calcCenter(table);
        }
      });
      var refs = [];
      angular.forEach($scope.references, function(reference){
        if (tbls[reference.table_name] && tbls[reference.ref_table_name]) {
          reference.x1 = tbls[reference.table_name].x || 0;
          reference.y1 = tbls[reference.table_name].y || 0;
          reference.x2 = tbls[reference.ref_table_name].x || 0;
          reference.y2 = tbls[reference.ref_table_name].y || 0;

          if (reference.table_name === $scope.currentTableName) {
            reference.stroke = '#f99';
          } else if (reference.ref_table_name === $scope.currentTableName) {
            reference.stroke = '#f99';
          } else {
            reference.stroke = 'black';
          }
          refs.push(reference);
        }
      });
      return refs;
    };

    $scope.currentTableName = null;

    $scope.selectTableView = function(obj) {
      obj = obj || {name: $scope.currentTableName};
      var connected = [];
      angular.forEach($scope.references, function(reference){
        if (reference.table_name === obj.name) {
          connected.push(reference.ref_table_name);
        } else if (reference.ref_table_name === obj.name) {
          connected.push(reference.table_name);
        }
      });

      $scope.currentTableName = null;
      angular.forEach($scope.tables, function(table){
        if (table.name === obj.name) {
          $scope.currentTableName = obj.name;
          table.current = true;
        } else {
          table.current = false;
        }
        table.connected = connected.indexOf(table.name) >= 0;
      });
    };

    $scope.snapshots = Snapshot.query();

    $scope.$watch('selectedSnapshot', function(){
      $scope.loadSelectedSnapshot();
    });

    $scope.contextMenu = new ContextMenu($scope);

    $scope.showStatus = function(){
      angular.forEach($scope.tables, function(table, key){
        console.log(table);
      });
    };

    function calcCenter(table) {
      if (table.element) {
        return {
          x: table.x + table.element.outerWidth()/2,
          y: table.y + table.element.outerHeight()/2
        };
      }
      return null;
    }
  }
]);

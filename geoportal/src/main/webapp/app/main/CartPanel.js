/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "app/common/Templated",
        "dojo/text!./templates/CartPanel.html",
        "dojo/i18n!../nls/resources"
        ], 
function(declare, lang, domConstruct, Templated, template, i18n) {

  var oThisClass = declare([Templated], {
    i18n: i18n,
    templateString: template,
    cart: [],

    addToCart: function(params) {
      //var cartWindow  = this.cartPanelNode;
      console.log("here -> " + params._id);
      cartNode = this.cartNode;

      this.cart.push({id:params._id, title:params.title});

      let data = Object.keys(this.cart[0]);
      if (cartNode.rows.length < 1) {
        this.generateTableHead(cartNode, data);
      } else {
        this.clearTable(cartNode);
      }
      this.generateTable(cartNode, this.cart);
    },

    clearCart: function() {
      this.cart = [];
      this.clearTable();
    },

    removeItem: function() {
      console.log("TODO");
    },

    orderCart: function() {
      console.log("TODO");
    },

    continueSearching: function() {
      var loc = document.location.toString().split('#')[0];
      document.location = loc + '#searchPanel';
      return false;
    },

    generateTableHead: function(table, data) {
      let thead = table.createTHead();
      let row = thead.insertRow();
      for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
      }
      let th = document.createElement("th");
      let text = document.createTextNode("Action");
      th.appendChild(text);
      row.appendChild(th);
    },

    clearTable: function() {
      cartNode = this.cartNode;      
      var rows = cartNode.rows;
      var i = rows.length;
      while (--i) {
        cartNode.deleteRow(i);
      }
    },

    generateTable: function(table, data) {
      let rowId = -1;
      for (let element of data) {
        rowId += 1;
        let row = table.insertRow();
        for (key in element) {
          let cell = row.insertCell();
          let text = document.createTextNode(element[key]);
          cell.appendChild(text);
        }
        
        /*
        xButton = domConstruct.create("a",{
          "class": "small",
          id: rowId,
          href: "javascript:void(0)",
          innerHTML: "X",
          onclick: function() {
            itemToRemove = this.id;
            tableSection = this.parentElement.parentElement.parentElement.deleteRow(itemToRemove);
          }
        })
        let cell = row.insertCell();
        cell.appendChild(xButton);
        */
      }
    }
  });

  return oThisClass;
});
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RepoView = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var RepoView = function RepoView(_ref) {
  var title = _ref.title;
  return _react["default"].createElement("p", null, "Welcome to ", title);
};

exports.RepoView = RepoView;
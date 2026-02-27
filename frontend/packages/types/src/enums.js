"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenegalRegion = exports.NotificationChannel = exports.VoteTargetType = exports.WorkflowStatus = exports.UserLevel = exports.UserRole = exports.ContributionStatus = exports.ContributionType = exports.SourceType = exports.PolicyTheme = exports.PolicyStatus = void 0;
var PolicyStatus;
(function (PolicyStatus) {
    PolicyStatus["NOT_STARTED"] = "NOT_STARTED";
    PolicyStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PolicyStatus["DELAYED"] = "DELAYED";
    PolicyStatus["COMPLETED"] = "COMPLETED";
    PolicyStatus["ABANDONED"] = "ABANDONED";
    PolicyStatus["REFORMULATED"] = "REFORMULATED";
})(PolicyStatus || (exports.PolicyStatus = PolicyStatus = {}));
var PolicyTheme;
(function (PolicyTheme) {
    PolicyTheme["HEALTH"] = "HEALTH";
    PolicyTheme["EDUCATION"] = "EDUCATION";
    PolicyTheme["INFRASTRUCTURE"] = "INFRASTRUCTURE";
    PolicyTheme["AGRICULTURE"] = "AGRICULTURE";
    PolicyTheme["JUSTICE"] = "JUSTICE";
    PolicyTheme["SECURITY"] = "SECURITY";
    PolicyTheme["DIGITAL"] = "DIGITAL";
    PolicyTheme["ENVIRONMENT"] = "ENVIRONMENT";
    PolicyTheme["OTHER"] = "OTHER";
})(PolicyTheme || (exports.PolicyTheme = PolicyTheme = {}));
var SourceType;
(function (SourceType) {
    SourceType["OFFICIAL"] = "OFFICIAL";
    SourceType["VERIFIED"] = "VERIFIED";
    SourceType["REPORTED"] = "REPORTED";
    SourceType["UNVERIFIED"] = "UNVERIFIED";
})(SourceType || (exports.SourceType = SourceType = {}));
var ContributionType;
(function (ContributionType) {
    ContributionType["TESTIMONY"] = "TESTIMONY";
    ContributionType["DOCUMENT"] = "DOCUMENT";
    ContributionType["LINK"] = "LINK";
    ContributionType["PHOTO"] = "PHOTO";
})(ContributionType || (exports.ContributionType = ContributionType = {}));
var ContributionStatus;
(function (ContributionStatus) {
    ContributionStatus["PENDING"] = "PENDING";
    ContributionStatus["APPROVED"] = "APPROVED";
    ContributionStatus["REJECTED"] = "REJECTED";
})(ContributionStatus || (exports.ContributionStatus = ContributionStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["EDITOR"] = "EDITOR";
    UserRole["CONTRIBUTOR"] = "CONTRIBUTOR";
    UserRole["VISITOR"] = "VISITOR";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserLevel;
(function (UserLevel) {
    UserLevel["OBSERVER"] = "OBSERVER";
    UserLevel["CONTRIBUTOR"] = "CONTRIBUTOR";
    UserLevel["EXPERT"] = "EXPERT";
    UserLevel["AMBASSADOR"] = "AMBASSADOR";
})(UserLevel || (exports.UserLevel = UserLevel = {}));
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["DRAFT"] = "DRAFT";
    WorkflowStatus["REVIEW"] = "REVIEW";
    WorkflowStatus["PUBLISHED"] = "PUBLISHED";
    WorkflowStatus["ARCHIVED"] = "ARCHIVED";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
var VoteTargetType;
(function (VoteTargetType) {
    VoteTargetType["POLICY"] = "POLICY";
    VoteTargetType["CONTRIBUTION"] = "CONTRIBUTION";
    VoteTargetType["COMMENT"] = "COMMENT";
})(VoteTargetType || (exports.VoteTargetType = VoteTargetType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["IN_APP"] = "IN_APP";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var SenegalRegion;
(function (SenegalRegion) {
    SenegalRegion["DAKAR"] = "DAKAR";
    SenegalRegion["THIES"] = "THIES";
    SenegalRegion["SAINT_LOUIS"] = "SAINT_LOUIS";
    SenegalRegion["LOUGA"] = "LOUGA";
    SenegalRegion["FATICK"] = "FATICK";
    SenegalRegion["KAOLACK"] = "KAOLACK";
    SenegalRegion["DIOURBEL"] = "DIOURBEL";
    SenegalRegion["ZIGUINCHOR"] = "ZIGUINCHOR";
    SenegalRegion["KOLDA"] = "KOLDA";
    SenegalRegion["TAMBACOUNDA"] = "TAMBACOUNDA";
    SenegalRegion["KEDOUGOU"] = "KEDOUGOU";
    SenegalRegion["MATAM"] = "MATAM";
    SenegalRegion["KAFFRINE"] = "KAFFRINE";
    SenegalRegion["SEDHIOU"] = "SEDHIOU";
})(SenegalRegion || (exports.SenegalRegion = SenegalRegion = {}));
//# sourceMappingURL=enums.js.map
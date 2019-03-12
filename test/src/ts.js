// If we don't test using a `.ts` file we get:
//
// { SyntaxError: /xxx/babel-plugin-parameter-decorator/test/src/index.js: Unexpected reserved word 'private' (37:26)
//
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var Greeter = (function () {
    function Greeter(message) {
        if (message === void 0) { message = ('message'); }
        this.greeting = message;
    }
    Greeter.prototype.greet = function (name) {
        return "Hello " + name + ", " + this.greeting;
    };
    Greeter.prototype.welcome = function (firstName, lastName) {
        return "Welcome " + lastName + "." + firstName;
    };
    Object.defineProperty(Greeter.prototype, "greet",
        __decorate([
            validate(),
            __param(0, required('name'))
        ], Greeter.prototype, "greet", Object.getOwnPropertyDescriptor(Greeter.prototype, "greet")));
    Object.defineProperty(Greeter.prototype, "welcome",
        __decorate([
            validate(),
            __param(0, required('firstName')),
            __param(1, required('lastName'))
        ], Greeter.prototype, "welcome", Object.getOwnPropertyDescriptor(Greeter.prototype, "welcome")));
    Greeter = __decorate([
        __param(0, required)
    ], Greeter);
    return Greeter;
})();
exports["default"] = Greeter;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var fs_1 = __importDefault(require("fs"));
axios_1.default.defaults.baseURL = "http://localhost:8081";
var output = fs_1.default.readFileSync(__dirname + '/../demoCode/java/SpellCheck.java');
axios_1.default.post('/processFile', {
    name: "SpellCheck.java",
    contents: output.toString()
}).then(function () {
    console.log("posted");
}).catch(function (err) {
    if (err.response) {
        console.log(err.response.data);
    }
    else {
        console.log(err);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBMEI7QUFDMUIsMENBQW9CO0FBRXBCLGVBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDO0FBRWpELElBQU0sTUFBTSxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLG1DQUFtQyxDQUFDLENBQUM7QUFFaEYsZUFBSyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7SUFDekIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRTtDQUM1QixDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxHQUFRO0lBQ2hCLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEM7U0FBTTtRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEI7QUFDSCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5heGlvcy5kZWZhdWx0cy5iYXNlVVJMID0gXCJodHRwOi8vbG9jYWxob3N0OjgwODFcIjtcblxuY29uc3Qgb3V0cHV0ID0gZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvLi4vZGVtb0NvZGUvamF2YS9TcGVsbENoZWNrLmphdmEnKTtcblxuYXhpb3MucG9zdCgnL3Byb2Nlc3NGaWxlJywge1xuICBuYW1lOiBcIlNwZWxsQ2hlY2suamF2YVwiLFxuICBjb250ZW50czogb3V0cHV0LnRvU3RyaW5nKClcbn0pLnRoZW4oKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcInBvc3RlZFwiKTtcbn0pLmNhdGNoKChlcnI6IGFueSkgPT4ge1xuICBpZiAoZXJyLnJlc3BvbnNlKSB7XG4gICAgY29uc29sZS5sb2coZXJyLnJlc3BvbnNlLmRhdGEpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKGVycik7XG4gIH1cbn0pO1xuIl19
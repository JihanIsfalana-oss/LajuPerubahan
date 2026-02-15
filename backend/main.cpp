#include "crow.h"
#include <iostream>
#include <vector>
#include <string>

struct CORSHandler {
    struct context {};
    void before_handle(crow::request& req, crow::response& res, context& ctx) {}
    void after_handle(crow::request& req, crow::response& res, context& ctx) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
};

int main() {
    crow::App<CORSHandler> app;

    std::cout << "Server C++ (Mode Aman) berjalan di port 8080..." << std::endl;

    CROW_ROUTE(app, "/graphql")
    .methods("OPTIONS"_method)
    ([](const crow::request& req) {
        return crow::response(204);
    });

    CROW_ROUTE(app, "/graphql")
    .methods("POST"_method)
    ([](const crow::request& req) {
        crow::json::wvalue final_response;
        std::vector<crow::json::wvalue> members_list;
        
        crow::json::wvalue m1;
        m1["name"] = "Liam";
        m1["role"] = "Lead Vocal";
        m1["description"] = "The Gallagherr";
        m1["instagram"] = "https://www.instagram.com/gallaaagherr?igsh=Z2t5eDVoZzlldzhn";
        members_list.push_back(m1);

        crow::json::wvalue m2;
        m2["name"] = "Ernest";
        m2["role"] = "Gitaris";
        m2["description"] = "Ernest Maarteens";
        m2["instagram"] = "https://www.instagram.com/ernesstwn?igsh=MTdidHlmMmFocWJ1aA==";
        members_list.push_back(m2);

        crow::json::wvalue m3;
        m3["name"] = "Falan";
        m3["role"] = "Drummer";
        m3["description"] = "Mr. JayBeat";
        m3["instagram"] = "https://www.instagram.com/flnisfalana?igsh=eWU2OGx1NXlzczc1";
        members_list.push_back(m3);

        crow::json::wvalue m4;
        m4["name"] = "Yurika";
        m4["role"] = "Bassist & Vocal 2";
        m4["description"] = "The Angel Of Laju Perubahan";
        m4["instagram"] = "Https://www.instagram.com/yurikarmdhni?igsh=MWY2cWR2a2IydGdjbA==";
        members_list.push_back(m4);

        final_response["data"]["getAllMembers"] = std::move(members_list);
        
        return crow::response(final_response);
    });

    app.port(8080).multithreaded().run();
    return 0;
}
cmake_minimum_required(VERSION 3.15)

project(laju_backend)

# Setting standar C++ 17 (Wajib untuk Crow & MongoCXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Cari library yang sudah diinstall vcpkg
find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)
# Crow biasanya header-only, tapi vcpkg membuatnya mudah ditemukan
find_path(CROW_INCLUDE_DIRS "crow.h") 

# Tambahkan file executable
add_executable(server main.cpp)

# Link library ke executable
target_include_directories(server PRIVATE ${CROW_INCLUDE_DIRS})
target_link_libraries(server PRIVATE mongo::mongocxx_shared)
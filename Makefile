CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra

SRC = main.cpp puissance4.cpp grille.cpp joueur.cpp pion.cpp position.cpp
OBJ = $(SRC:.cpp=.o)
TARGET = puissance4

all: $(TARGET)

$(TARGET): $(OBJ)
	$(CXX) $(CXXFLAGS) -o $@ $^

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJ) $(TARGET)

.PHONY: all clean


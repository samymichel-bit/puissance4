CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra

SRC = main.cpp puissance4.cpp grille.cpp joueur.cpp pion.cpp position.cpp
OBJ = $(SRC:.cpp=.o)
TARGET = puissance4

TEST_SRC = test_invariants.cpp grille.cpp pion.cpp position.cpp joueur.cpp
TEST_TARGET = test_invariants

all: $(TARGET)

$(TARGET): $(OBJ)
	$(CXX) $(CXXFLAGS) -o $@ $^

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

test: $(TEST_TARGET)
	./$(TEST_TARGET)

$(TEST_TARGET): $(TEST_SRC)
	$(CXX) $(CXXFLAGS) -o $@ $^

clean:
	rm -f *.o $(TARGET) $(TEST_TARGET)

.PHONY: all test clean

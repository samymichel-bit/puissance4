#ifndef POSITION_H
#define POSITION_H

class Position {
private:
    int x;
    int y;

public:
    Position();
    Position(int x, int y);
    int getX() const;
    int getY() const;
    void setX(int x);
    void setY(int y);
};

#endif


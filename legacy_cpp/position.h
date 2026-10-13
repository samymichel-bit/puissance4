#ifndef POSITION_H
#define POSITION_H

class Position {
private:
    int ligne;
    int colonne;

public:
    Position();
    Position(int l, int c);

    int getLigne() const;
    int getColonne() const;

    void setLigne(int l);
    void setColonne(int c);

    bool estValide(int maxLignes = 6, int maxColonnes = 7) const;
};

#endif // POSITION_H

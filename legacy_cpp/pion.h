#ifndef PION_H
#define PION_H

class Pion {
private:
    char symbole;
    int joueurId;

public:
    Pion();
    Pion(char s, int id = 0);

    char getSymbole() const;
    void setSymbole(char s);

    int getJoueurId() const;
    void setJoueurId(int id);

    bool estVide() const;
};

#endif // PION_H

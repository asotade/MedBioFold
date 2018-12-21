import Bio
from Bio.PDB import calc_angle
from Bio.PDB.PDBParser import PDBParser
import urllib
import string
import sys

pdbFile = sys.argv[1]
output = sys.argv[2]

_aa_index = [('ALA', 'A'),
             ('CYS', 'C'),
             ('ASP', 'D'),
             ('GLU', 'E'),
             ('PHE', 'F'),
             ('GLY', 'G'),
             ('HIS', 'H'),
             ('HSE', 'H'),
             ('HSD', 'H'),
             ('ILE', 'I'),
             ('LYS', 'K'),
             ('LEU', 'L'),
             ('MET', 'M'),
             ('MSE', 'M'),
             ('ASN', 'N'),
             ('PRO', 'P'),
             ('GLN', 'Q'),
             ('ARG', 'R'),
             ('SER', 'S'),
             ('THR', 'T'),
             ('VAL', 'V'),
             ('TRP', 'W'),
             ('TYR', 'Y')]

def GetSeqFromPDB(pdb):
    f1 = open(pdb, 'r')
    res1, res2 = pdbSeq(f1)
    f1.close()
    return res1

def pdbSeq(pdb, use_atoms=False):
    # Try using SEQRES
    seq = [l for l in pdb if l[0:6] == "SEQRES"]
    if len(seq) != 0 and not use_atoms:
        seq_type = "SEQRES"
        chain_dict = dict([(l[11], []) for l in seq])
        for c in chain_dict.keys():
            chain_seq = [l[19:70].split() for l in seq if l[11] == c]
            for x in chain_seq:
                chain_dict[c].extend(x)
    # Otherwise, use ATOM
    else:
        seq_type = "ATOM  "
        # Check to see if there are multiple models.  If there are, only look
        # at the first model.
        models = [i for i, l in enumerate(pdb) if l.startswith("MODEL")]
        if len(models) > 1:
            pdb = pdb[models[0]:models[1]]
            # Grab all CA from ATOM entries, as well as MSE from HETATM
        atoms = []
        for l in pdb:
            if l[0:6] == "ATOM  " and l[13:16] == "CA ":
                # Check to see if this is a second conformation of the previous
                # atom
                if len(atoms) != 0:
                    if atoms[-1][17:26] == l[17:26]:
                        continue
                atoms.append(l)
            elif l[0:6] == "HETATM" and l[13:16] == "CA " and l[17:20] == "MSE":
                # Check to see if this is a second conformation of the previous
                # atom
                if len(atoms) != 0:
                    if atoms[-1][17:26] == l[17:26]:
                        continue
                atoms.append(l)
        chain_dict = dict([(l[21], []) for l in atoms])
        for c in chain_dict.keys():
            chain_dict[c] = [l[17:20] for l in atoms if l[21] == c]
    AA3_TO_AA1 = dict(_aa_index)
    tempchain = chain_dict.keys()
    seq = ''
    for i in tempchain:
        for j in chain_dict[i]:
            if j in AA3_TO_AA1.keys():
                seq = seq + (AA3_TO_AA1[j])
            else:
                seq = seq + ('X')
    return seq, seq_type

print(GetSeqFromPDB(pdbFile))
sys.stdout.flush()


def GetProteinSequenceFromTxt(savefile,pdb):
    f1 = open(savefile, 'w')
    temp = GetSeqFromPDB(pdb)
    print ("--------------------------------------------------------")
    print ("The  protein sequence has been downloaded!")
    print (temp)
    f1.write(temp)
    print ("--------------------------------------------------------")
    f1.close()
    return 0


GetProteinSequenceFromTxt(output,pdbFile)

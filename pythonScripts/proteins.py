#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Sun May  6 21:27:27 2018

@author: Tom
"""

import matplotlib as mpl
import matplotlib.pyplot as plt
import mpl_toolkits
from mpl_toolkits.mplot3d import Axes3D
import os
import csv
import sys

pdb_file = sys.argv[1]

# Input a pdb file, e.g. '1mp6.pdb', output a list of lines containing atom information.
def atom_list(file):
    atoms=[]
    for line in open(file):
        list = line.split()
        id = list[0]
        if id == 'ATOM':
            atoms.append(list)
    return atoms

# Input a list of atom information, output a truncated list with only a single sample
def check_for_repeats(atoms):
    atom_numbers = [entry[1] for entry in atoms]
    number_ones = [i for i, x in enumerate(atom_numbers) if x == "1"]
    if len(number_ones) > 1:
        atoms = atoms[0:number_ones[1]]
    return atoms

def number_of_samples(atoms):
    atom_numbers = [entry[1] for entry in atoms]
    number_ones = [i for i, x in enumerate(atom_numbers) if x == "1"]
    return len(number_ones)

# Input a pdb file, output the name of the protein
def protein_name(file):
    data = open(file)
    file_name = data.name
    prot_name=''
    for j in range(0,4):
        prot_name=prot_name+file_name[j]
    return prot_name

# Input a list of atom information, output list of float coordinates of CA atoms.
def carbon_list(atoms):
    carbons=[]
    for atom in atoms:
        type = atom[2]
        if type == 'CA':
            carbons.append([float(atom[6]),float(atom[7]),float(atom[8])])
    return carbons

# Input a list of atom information, output [x, y , z] coordinates of CA atoms.
def carbon_coords(atoms):
    x = []
    y = []
    z = []
    for atom in atoms:
        type = atom[2]
        if type == 'CA':
            x.append(float(atom[6]))
            y.append(float(atom[7]))
            z.append(float(atom[8]))
    return [x, y, z]

# Input pdb file, output [x, y ,z] coordinates of CA atoms.
def pdb2coords(file):
    atoms = atom_list(file)
    atoms = check_for_repeats(atoms)
    [x,y,z] = carbon_coords(atoms)
    return [x, y, z]

def pdb2coords_all_samples(file):
    atoms = atom_list(file)
    #print(atoms)
    [num_samp, num_carbons] = analyze_pdb(file)
    sample_length = len(atoms)/num_samp
    backbones = []
    for j in range(0,num_samp):
        start = int(j*sample_length)
        end = int((j+1)*sample_length)
        print(start)
        print(end)
        atom_sample = atoms[start:end]
        [x, y, z] = carbon_coords(atom_sample)
        backbones.append([x, y, z])
        if j == 0 :
            print (atom_sample)
            print("\n\n\n-----------------------------------------------------------------\n\n\n")
            print ([x,y,z])
    return backbones

########## Main Functions ############

# Input pdb file, output some basic information
def analyze_pdb(file):
    atoms = atom_list(file)
    carbon_atoms = carbon_list(check_for_repeats(atoms))
    num_samp = number_of_samples(atoms)
    num_carbons = len(carbon_atoms)
    print ("Number of samples: ", num_samp)
    print ("Number of C-alpha atoms per sample: ", num_carbons)
    return [num_samp, num_carbons]

# Input pdb file, produces plot of protein backbone.
def plot_backbone(file):
    mpl.rcParams['legend.fontsize'] = 10
    fig = plt.figure()
    ax = fig.gca(projection='3d')
    [x,y,z]=pdb2coords(file)
    prot_name = protein_name(file)
    ax.plot(x, y, z, label=prot_name+' Backbone')
    ax.legend()
    plt.show()

# Input pdb file, produces plots of all samples of the backbone.
def plot_all_backbones(file):
    mpl.rcParams['legend.fontsize'] = 10
    fig = plt.figure()
    ax = fig.gca(projection='3d')
    backbones = pdb2coords_all_samples(file)
    for j in range(0,len(backbones)):
        [x,y,z] = backbones[j]
        print(j)
        ax.plot(x, y, z)
    plt.show()

# Input pdb file *.pdb, output a txt file *.csv containing only backbone coords
def pdb_file_fixer(file):
    coords = pdb2coords(file)
    name = protein_name(file)
    with open(name+".csv", "wb") as f:
        writer = csv.writer(f)
        writer.writerows(coords)

# Applies pdb_file_fixer to all files in a specified path.
def pdb2coords_all_files(path):
    for file in os.listdir(path):
        if '.pdb' in file:
            pdb_file_fixer(file)

plot_all_backbones(pdb_file)

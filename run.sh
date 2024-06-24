#!/bin/sh

echo "Instalando node_modules"
npm i

echo "Inicializando configurações"
npm run config <<< ec2-metadata -i | cut -d " " -f 2

echo "Fazendo build de executável"
npm run build

echo "Iniciando..."
npm run watch
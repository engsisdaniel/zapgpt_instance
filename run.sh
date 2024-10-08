#!/bin/sh

echo "Instalando node_modules"
npm i

echo "Inicializando configurações"

TEMP=$(ec2-metadata -i | cut -d " " -f 2)
npm run config <<< $TEMP

echo "Fazendo build de executável"
npm run build

echo "Iniciando..."
npm run watch
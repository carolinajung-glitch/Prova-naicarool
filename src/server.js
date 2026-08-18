require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();
app.use(express.json()); 

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.post('/equipes', async (req, res) => {
  try {
    const { nome, especialidade } = req.body;
    const novaEquipe = await prisma.equipe.create({
      data: { nome, especialidade }
    });
    res.status(201).json({ mensagem: 'Equipe criada com sucesso!', equipe: novaEquipe });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao criar equipe.', detalhes: erro.message });
  }
});

app.get('/equipes', async (req, res) => {
  try {
    const equipes = await prisma.equipe.findMany({
      include: { desenvolvedores: true }
    });
    res.status(200).json(equipes);
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao buscar equipes.' });
  }
});

app.put('/equipe', async (req, res) => {
  try {
    const { id, nome, especialidade } = req.body;
    const equipeAtualizada = await prisma.equipe.update({
      where: { id: parseInt(id) },
      data: { nome, especialidade }
    });
    res.status(200).json({ mensagem: 'Equipe atualizada!', equipe: equipeAtualizada });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao atualizar equipe. Verifique se o ID existe.' });
  }
});

app.delete('/equipe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.equipe.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send(); 
  } catch (erro) {
    res.status(400).json({ erro: 'Falha ao deletar. Remova os desenvolvedores desta equipe primeiro!' });
  }
});

app.post('/desenvolvedores', async (req, res) => {
  try {
    const { nome, nivel, equipeId } = req.body;
    const novoDev = await prisma.desenvolvedor.create({
      data: { nome, nivel, equipeId: parseInt(equipeId) }
    });
    res.status(201).json({ mensagem: 'Desenvolvedor contratado!', desenvolvedor: novoDev });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao criar desenvolvedor. Verifique se a equipeId existe.' });
  }
});

app.get('/equipes/:id/desenvolvedores', async (req, res) => {
  try {
    const { id } = req.params;
    const devsDaEquipe = await prisma.desenvolvedor.findMany({
      where: { equipeId: parseInt(id) }
    });
    res.status(200).json(devsDaEquipe);
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao buscar desenvolvedores desta equipe.' });
  }
});

app.put('/desenvolvedores', async (req, res) => {
  try {
    const { id, nome, nivel, equipeId } = req.body;
    const devAtualizado = await prisma.desenvolvedor.update({
      where: { id: parseInt(id) },
      data: { nome, nivel, equipeId: parseInt(equipeId) }
    });
    res.status(200).json({ mensagem: 'Desenvolvedor atualizado!', desenvolvedor: devAtualizado });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao atualizar desenvolvedor.' });
  }
});

app.delete('/desenvolvedores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.desenvolvedor.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao deletar desenvolvedor.' });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sistema da DevStudio Analytics rodando na porta ${PORT}`);
});
	const chai = require('chai');
	const expect = chai.expect;
	const request = require('supertest');

	const app = require('../../graphql/app');

	describe('Mutation: Teste do Transfer (GraphQL)', () => {
		let jwtToken;

		before(async () => {

			// Cria usuário
			const registerRogerio = `
				mutation {
					registerUser(username: "Rogerio", password: "123456") {
						username
					}
				}
			`;
			await request(app)
				.post('/graphql')
				.send({ query: registerRogerio });

			// Cria usuário
			const registerLais = `
				mutation {
					registerUser(username: "Lais", password: "123456") {
						username
					}
				}
			`;

			await request(app)
				.post('/graphql')
				.send({ query: registerLais });

			// Login via GraphQL
			const loginMutation = `mutation LoginUser($username: String!, $password: String!) {
				loginUser(username: $username, password: $password) {
					token
				}
			}`;
	
			const loginVariaveis = {
				username: "Rogerio", 
				password: "123456"
			};

			const respostaLogin = await request(app)
				.post('/graphql')
				.send({
					query: loginMutation,
					variables: loginVariaveis
				});

			jwtToken = respostaLogin.body.data.loginUser.token;
			if (!jwtToken) throw new Error('Token JWT não foi retornado pelo login');
	
		});

		it('TM001 - deve realizar transferência com sucesso', async () => {
				const resposta = await request(app)
						.post('/graphql')
						.set('Authorization', `Bearer ${jwtToken}`)
						.send({ 
							query: `
								mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
									createTransfer(from: $from, to: $to, value: $value) {
										from
										to
										value
									}
								}`, 
							variables: { from: 'Rogerio', to: 'Lais', value: 10 }});
						
				expect(resposta.status).to.equal(200);
				const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosnoMutationSucessoCom200OK.json')
				expect(resposta.body).to.deep.equal(respostaEsperada);
		});

		it('TM002 - deve falhar ao transferir sem saldo suficiente', async () => {
			const resposta = await request(app)
				.post('/graphql')
				.set('Authorization', `Bearer ${jwtToken}`)
				.send({ 
					query: `
						mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
							createTransfer(from: $from, to: $to, value: $value) {
								from
								to
								value
							}
						}`, 
					variables: { from: 'Rogerio', to: 'Lais', value: 1000 }});
			expect(resposta.status).to.equal(200);
			expect(resposta.body).to.have.nested.property('errors[0].message', 'Saldo insuficiente')
		});

		it('TM003 - deve falhar ao transferir sem token de autenticação', async () => {
			const resposta = await request(app)
				.post('/graphql')
				.send({ 
					query: `
						mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
							createTransfer(from: $from, to: $to, value: $value) {
								from
								to
								value
							}
						}`, 
					variables: { from: 'Rogerio', to: 'Lais', value: 10 }});
			expect(resposta.status).to.equal(200);
			 expect(resposta.body).to.have.nested.property('errors[0].message', 'Autenticação obrigatória')
		});
	});

	after(async () => {
		
		if (app && app.close) app.close();
	});
	

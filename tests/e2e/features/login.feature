# language: pt

@login
Funcionalidade: Login do cliente
  Como cliente da loja
  Quero entrar com meu e-mail e senha
  Para acessar minha conta e fazer pedidos

  Contexto:
    Dado que estou na página de login

  Cenário: Login com credenciais válidas
    Quando faço login com credenciais válidas
    Então devo estar na página da minha conta
    E devo ver o título da página "My account"
    E devo ver a opção de sair

  Cenário: Login com senha incorreta
    Quando faço login com meu e-mail e a senha "senha-errada"
    Então devo continuar na página de login
    E devo ver o erro de login "Invalid email or password"

  Cenário: Login com usuário não cadastrado
    Quando faço login com o e-mail "fantasma@exemplo.com" e a senha "welcome01"
    Então devo continuar na página de login
    E devo ver o erro de login "Invalid email or password"

  Cenário: Login com campos obrigatórios em branco
    Quando envio o formulário de login sem preencher nada
    Então devo continuar na página de login
    E devo ver o erro do e-mail "Email is required"
    E devo ver o erro da senha "Password is required"

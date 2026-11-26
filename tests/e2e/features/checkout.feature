# language: pt

@checkout
Funcionalidade: Checkout e pagamento
  Como cliente logado
  Quero comprar um produto com cartão de crédito
  Para concluir o pedido do carrinho até a confirmação

  Contexto:
    Dado que estou logado como cliente
    E o produto "Pliers" está no carrinho

  Cenário: Compra concluída com dados válidos
    Quando inicio o checkout com um endereço válido
    E pago com um cartão válido
    Então devo ver a mensagem de pagamento aprovado
    Quando confirmo o pedido
    Então devo ver o pedido confirmado com número de nota fiscal

  Cenário: Checkout bloqueado com endereço incompleto
    Quando inicio o checkout
    E limpo os campos obrigatórios do endereço
    Então o botão de avançar do endereço deve ficar desabilitado

  Cenário: Pagamento recusado com número de cartão inválido
    Quando inicio o checkout com um endereço válido
    E pago com o cartão número "1234"
    Então devo ver a mensagem de erro "Invalid card number format"
    E o botão de pagamento deve ficar desabilitado

  Cenário: Pagamento recusado com cartão vencido
    Quando inicio o checkout com um endereço válido
    E preencho o cartão número "4111-1111-1111-1111" com validade "01/2020"
    Então devo ver a mensagem de erro "Expiration date must be in the future"
    E o botão de pagamento deve ficar desabilitado

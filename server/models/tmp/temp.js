function bubbleSortBakeryOrders(orderNumbers) {
    for(let i = 0; i < orderNumbers.length; i++) {
      for(let j = 0; j < orderNumbers.length-i; j++) {
        if(orderNumbers[i] > orderNumbers[j]){
          let temp = orderNumbers[i];
          orderNumbers[i] =  orderNumbers[j];
          orderNumbers[j] = temp;
        }
      }
    }
    return orderNumbers;
  }
  const orders = [5, 2, 8, 1, 9, 4];
  const sortedOrders = bubbleSortBakeryOrders(orders);
  console.log(sortedOrders);
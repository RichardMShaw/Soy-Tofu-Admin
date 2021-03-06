import React from 'react'
import { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FoodAPI from '../../utils/FoodAPI'
import CatagoryAPI from '../../utils/CatagoryAPI'
import {
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CardActionArea,
} from '@material-ui/core'

import numberToMoney from '../../utils/lib/numberToMoney'

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '95%',
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
      maxWidth: '75%',
    },
    marginBottom: '2rem',
  },
  media: {
    height: 280,
  },
  foodCard: {
    width: '100%',
  },
}))

const { createFood, getFood, updateFood, deleteFood } = FoodAPI
const { createCatagory, getCatagories, deleteCatagory } = CatagoryAPI

const AddFood = (props) => {
  const classes = useStyles()

  const emptyState = {
    name: '',
    image: '',
    catagory: '',
    description: '',
    options: [
      {
        name: 'Default',
        choices: [
          {
            name: 'Default',
            price: '',
          },
        ],
      },
    ],
    lowestPrice: 0,
    highestPrice: 0,
  }

  const [addFoodState, setAddFoodState] = useState({
    name: '',
    image: '',
    catagory: '',
    description: '',
    options: [
      {
        name: 'Default',
        choices: [
          {
            name: 'Default',
            price: '',
          },
        ],
      },
    ],
    lowestPrice: 0,
    highestPrice: 0,
  })

  const [addCatagoryState, setAddCatagoryState] = useState({
    name: '',
  })

  const [catagoryAPIState, setCatagoryAPIState] = useState({
    catagories: [],
  })

  const [foodsState, setFoodsState] = useState({
    foods: [],
  })

  const [indexState, setIndexState] = useState({
    index: -1,
  })

  const verifyAddFoodState = () => {
    let keys = Object.keys(addFoodState)
    let len = keys.length
    for (let i = 0; i < len; i++) {
      if (
        typeof addFoodState[keys[i]] != 'number' &&
        addFoodState[keys[i]].length < 1
      ) {
        if (keys[i] !== 'description') {
          return false
        }
      }
    }
    let options = addFoodState.options
    let optionsLen = options.length
    for (let i = 0; i < optionsLen; i++) {
      if (addFoodState.options[i].name === '') {
        return false
      }
      let choices = options[i].choices
      let choicesLen = choices.length
      for (let j = 0; j < choicesLen; j++) {
        if (choices[j].name === '') {
          return false
        }
      }
    }
    return true
  }

  const isAddFoodEnabled = verifyAddFoodState()

  const verifyCatagoryState = () => {
    let name = addCatagoryState.name
    if (name.length < 1) {
      return false
    }
    let catagories = catagoryAPIState.catagories
    let len = catagories.length
    for (let i = 0; i < len; i++) {
      if (catagories[i].name === name) {
        return false
      }
    }
    return true
  }

  const isAddCatagoryEnabled = verifyCatagoryState()

  const renderRemoveOptionButton = (index) => {
    if (index > 0) {
      return (
        <Button
          size="small"
          color="secondary"
          variant="contained"
          onClick={() => handleRemoveOption(index)}
        >
          Remove Option
        </Button>
      )
    }
  }

  const renderRemoveChoiceButton = (option, choice) => {
    if (choice > 0) {
      return (
        <Button
          size="small"
          color="secondary"
          variant="contained"
          onClick={() => handleRemoveChoice(option, choice)}
        >
          Remove Choice
        </Button>
      )
    }
  }

  const handleAddOption = () => {
    let newState = addFoodState
    newState.options.push({
      name: '',
      choices: [
        {
          name: '',
          price: '',
        },
      ],
    })
    setAddFoodState({ ...newState })
  }

  const handleRemoveOption = (index) => {
    let newState = addFoodState
    newState.options.splice(index, 1)
    setAddFoodState({ ...newState })
  }

  const handleOptionChange = (event, index) => {
    let newState = addFoodState
    newState.options[index][event.target.name] = event.target.value
    setAddFoodState({ ...newState })
  }

  const handleAddChoice = (index) => {
    let newState = addFoodState
    newState.options[index].choices.push({
      name: '',
      choices: [
        {
          name: '',
          price: '',
        },
      ],
    })
    setAddFoodState({ ...newState })
  }

  const handleRemoveChoice = (option, choice) => {
    let newState = addFoodState
    newState.options[option].choices.splice(choice, 1)
    setAddFoodState({ ...newState })
  }

  const handleChoiceChange = (event, option, choice) => {
    let newState = addFoodState
    newState.options[option].choices[choice][event.target.name] =
      event.target.value
    setAddFoodState({ ...newState })
  }

  const handleChoicePriceChange = (event, option, choice) => {
    event.target.value = event.target.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1')
    let money = event.target.value.split('.')
    if (money.length > 1) {
      if (money[1].length > 2) {
        money[1] = money[1].slice(0, 2)
      }
      event.target.value = `${money[0]}.${money[1]}`
    }
    let newState = addFoodState
    newState.options[option].choices[choice].price = event.target.value
    setAddFoodState({ ...newState })
    handleLowHighCost()
  }

  const handleChangeCatagory = (event) => {
    setAddCatagoryState({ ...addCatagoryState, name: event.target.value })
  }

  const handleInputChange = (event) => {
    setAddFoodState({
      ...addFoodState,
      [event.target.name]: event.target.value,
    })
  }

  const handleLowHighCost = () => {
    let lowest = 0
    let highest = 0
    let options = addFoodState.options
    let optionsLen = options.length
    for (let i = 0; i < optionsLen; i++) {
      let choices = options[i].choices
      let choicesLen = choices.length
      let price = choices[0].price
      if (price === '' || price === '.') {
        price = 0
      } else {
        price = parseFloat(price)
      }

      let low = price
      let high = price
      for (let j = 1; j < choicesLen; j++) {
        price = parseFloat(choices[j].price)
        low = low > price ? (low = price) : low
        high = high < price ? (high = price) : high
      }
      lowest += low
      highest += high
    }

    setAddFoodState({
      ...addFoodState,
      lowestPrice: lowest,
      highestPrice: highest,
    })
  }

  const handleCreateFood = (event) => {
    event.preventDefault()
    let food = addFoodState
    let optionsLen = food.options.length
    for (let i = 0; i < optionsLen; i++) {
      let choicesLen = food.options[i].choices.length
      for (let j = 0; j < choicesLen; j++) {
        let price = parseFloat(food.options[i].choices[j].price)
        food.options[i].choices[j].price = isNaN(price) ? 0 : price
      }
      food.options[i].choices.sort((a, b) => (a.price > b.price ? 1 : -1))
    }
    if (indexState.index < 0) {
      createFood(food)
        .then(() => {
          getFood().then(({ data: foods }) => {
            setFoodsState({ foods: foods })
            setAddFoodState({ ...emptyState })
          })
        })
        .catch((err) => console.error(err))
    } else {
      updateFood(food._id, food)
        .then(() => {
          getFood().then(({ data: foods }) => {
            setFoodsState({ foods: foods })
          })
        })
        .catch((err) => console.error(err))
    }
  }

  const handleCreateCatagory = (event) => {
    createCatagory(addCatagoryState)
    getCatagories()
      .then(({ data: catagories }) => {
        setAddCatagoryState({ name: '' })
        setCatagoryAPIState({ catagories: catagories })
      })
      .catch((err) => console.error(err))
  }

  const handleDeleteCatagory = (id) => {
    deleteCatagory(id)
      .then(() => {
        getCatagories().then(({ data: catagories }) => {
          setCatagoryAPIState({ catagories: catagories })
        })
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    getCatagories()
      .then(({ data: catagories }) => {
        setCatagoryAPIState({ catagories: catagories })
      })
      .catch((err) => console.error(err))
    getFood()
      .then(({ data: foods }) => {
        setFoodsState({ foods: foods })
      })
      .catch((err) => console.error(err))
  }, [])

  const handleSelectFood = (index) => {
    let food = JSON.parse(JSON.stringify(foodsState.foods[index]))
    setAddFoodState({ ...food })
    setIndexState({ index: index })
  }

  const renderAddButton = () => {
    if (indexState.index < 0) {
      return (
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={handleCreateFood}
          disabled={!isAddFoodEnabled}
        >
          Add Food To Menu
        </Button>
      )
    } else {
      return (
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={handleCreateFood}
          disabled={!isAddFoodEnabled}
        >
          {`Edit Food #${indexState.index}`}
        </Button>
      )
    }
  }

  const handleDeleteFood = (index) => {
    let food = foodsState.foods[index]
    deleteFood(food._id)
      .then(() => {
        getFood().then(({ data: foods }) => {
          let i = indexState.index
          if (i >= index) {
            i = i - 1
          }
          setIndexState({ index: i })
          setFoodsState({ foods: foods })
          setAddFoodState({ ...emptyState })
        })
      })
      .catch((err) => console.error(err))
  }
  return (
    <Grid container xs={12}>
      <Grid xs={3}>
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={() => {
            setIndexState({ index: -1 })
            setAddFoodState({ ...emptyState })
          }}
        >
          Add New Food
        </Button>
        {foodsState.foods.map((food, i) => (
          <Card>
            <CardActionArea onClick={() => handleSelectFood(i)}>
              <img
                src={food.image}
                alt={food.name}
                width={'100%'}
                height={'90px'}
              />
              <Button
                size="small"
                color="secondary"
                variant="contained"
                style={{ width: '100%' }}
                onClick={(event) => {
                  event.stopPropagation()
                  handleDeleteFood(i)
                }}
              >
                Remove
              </Button>
              <CardContent>
                <Typography>ID: {food._id}</Typography>
                <Typography>Name: {food.name}</Typography>
                <Typography>Catagory:{food.catagory}</Typography>
                {food.options.map((option) => (
                  <Card>
                    <CardContent>
                      <Typography>Option: {option.name}</Typography>
                      {option.choices.map((choice) => (
                        <Card>
                          <Typography>Choice: {choice.name}</Typography>
                          <Typography>
                            Price: ${numberToMoney(choice.price)}
                          </Typography>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                ))}
                <Typography>
                  Lowest Price: ${numberToMoney(food.lowestPrice)}
                </Typography>
                <Typography>
                  Highest Price: ${numberToMoney(food.highestPrice)}
                </Typography>
                <Typography>Description:</Typography>
                <Card>
                  <CardContent>
                    <Typography>{food.description}</Typography>
                  </CardContent>
                </Card>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Grid>
      <Grid xs={9}>
        <Card className={classes.root}>
          <Typography>Add Food</Typography>
          <CardContent>
            <Card>
              <CardContent>
                <TextField
                  id="outlined-basic"
                  label="Name"
                  name="name"
                  variant="outlined"
                  onChange={handleInputChange}
                  value={addFoodState.name}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <TextField
                  id="outlined-basic"
                  label="Image"
                  name="image"
                  variant="outlined"
                  onChange={handleInputChange}
                  value={addFoodState.image}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography>Options</Typography>
                {addFoodState.options.map((option, i) => (
                  <CardContent>
                    <CardContent>
                      <TextField
                        id="outlined-basic"
                        label="Option"
                        name="name"
                        variant="outlined"
                        value={addFoodState.options[i].name}
                        onChange={(event) => handleOptionChange(event, i)}
                      />
                      {option.choices.map((choice, j) => (
                        <CardContent>
                          <CardContent>
                            <TextField
                              id="outlined-basic"
                              label="Choice"
                              name="name"
                              variant="outlined"
                              value={addFoodState.options[i].choices[j].name}
                              onChange={(event) =>
                                handleChoiceChange(event, i, j)
                              }
                            />
                            <TextField
                              id="outlined-basic"
                              label="Price"
                              name="price"
                              variant="outlined"
                              value={addFoodState.options[i].choices[j].price}
                              onChange={(event) =>
                                handleChoicePriceChange(event, i, j)
                              }
                            />
                          </CardContent>
                          {renderRemoveChoiceButton(i, j)}
                        </CardContent>
                      ))}
                      <Button
                        size="small"
                        color="primary"
                        variant="contained"
                        onClick={() => handleAddChoice(i)}
                      >
                        Add Choice
                      </Button>
                    </CardContent>
                    {renderRemoveOptionButton(i)}
                  </CardContent>
                ))}
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  onClick={handleAddOption}
                >
                  Add Option
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <InputLabel id="catagory-label">Catagory</InputLabel>
                <Select
                  labelId="catagory-label"
                  id="demo-simple-select"
                  name="catagory"
                  value={addFoodState.catagory}
                  onChange={handleInputChange}
                >
                  {catagoryAPIState.catagories.map((catagory) => (
                    <MenuItem value={catagory.name}>{catagory.name}</MenuItem>
                  ))}
                </Select>
              </CardContent>
            </Card>

            <CardContent>
              <CardContent>
                <TextField
                  id="outlined-basic"
                  label="Description"
                  name="description"
                  variant="outlined"
                  onChange={handleInputChange}
                  value={addFoodState.description}
                />
              </CardContent>
            </CardContent>
            <Card>
              <CardContent>
                <Typography>
                  Lowest Cost: ${numberToMoney(addFoodState.lowestPrice)}
                </Typography>
                <Typography>
                  Highest Cost: ${numberToMoney(addFoodState.highestPrice)}
                </Typography>
              </CardContent>
            </Card>
            {renderAddButton()}
          </CardContent>
          <Typography>Add Catagory</Typography>
          <CardContent>
            <TextField
              id="outlined-basic"
              label="Name"
              name="name"
              variant="outlined"
              onChange={handleChangeCatagory}
              value={addCatagoryState.name}
            />
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={handleCreateCatagory}
              disabled={!isAddCatagoryEnabled}
            >
              Add
            </Button>
            {catagoryAPIState.catagories.map((catagory) => (
              <Card>
                <CardContent>
                  <Typography>{catagory.name}</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() => handleDeleteCatagory(catagory._id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AddFood

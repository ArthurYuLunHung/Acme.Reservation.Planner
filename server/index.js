const {
  client,
  createTables,
  fetchCustomers,
  fetchRestaurants,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchReservations,
  destroyReservation,
} = require("./db");
const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});

app.delete(
  "api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id: req.body.restaurant_id,
        date: req.body.date,
        party_count: req.body.party_count,
      })
    );
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();

  await createTables();
  console.log("tables created");

  const [arthur, wade, gavin, restaurant1, restaurant2, restaurant3] =
    await Promise.all([
      createCustomer({ name: "arthur" }),
      createCustomer({ name: "wade" }),
      createCustomer({ name: "Gavin" }),

      createRestaurant({ name: "restaurant1" }),
      createRestaurant({ name: "restaurant2" }),
      createRestaurant({ name: "restaurant3" }),
    ]);

  console.log("data seeded");

  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2, reservation3] = await Promise.all([
    createReservation({
      customer_id: arthur.id,
      restaurant_id: restaurant1.id,
      date: "05/07/2024",
      party_count: 6,
    }),
    createReservation({
      customer_id: wade.id,
      restaurant_id: restaurant2.id,
      date: "05/13/2024",
      party_count: 3,
    }),
    createReservation({
      customer_id: gavin.id,
      restaurant_id: restaurant3.id,
      date: "05/27/2024",
      party_count: 4,
    }),
  ]);

  console.log("Reservations created");
  console.log(await fetchReservations());

  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });

  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();

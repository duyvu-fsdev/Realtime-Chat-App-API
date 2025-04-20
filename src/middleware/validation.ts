import { NextFunction, Request, Response } from "express";
import Validator from "validatorjs";
import { User } from "../db/models";
import { resHelper } from "../utils";

const otpRegisterValidation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const rules: Validator.Rules = { email: "required|email" };
    const validate = new Validator({ email }, rules);

    if (validate.fails()) {
      const errors = Object.entries(validate.errors.errors)
        .map(([field, messages]) => messages.map((message) => message))
        .flat();
      return res.status(400).send(resHelper.error(400, "Bad Request", errors));
    }
    const user = await User.findOne({ attributes: ["id"], where: { email } });
    if (user) return res.status(409).send(resHelper.error(409, "Conflict", "Email already used"));
    res.locals.email = email;
    next();
  } catch (error: any) {
    console.log("otpRegisterValidation", error);
    return res.status(500).send(resHelper.error(500, "Internal Server Error"));
  }
};

const registerValidation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, role, otp, gender, displayName } = req.body;

    const rules: Validator.Rules = {
      email: "required|email",
      password: "required|min:6",
      confirmPassword: "required|same:password",
      firstName: "required|string|max:50",
      lastName: "required|string|max:50",
      displayName: "required|string",
      otp: "required|digits:6",
      gender: "required|string",
    };

    // Đảm bảo otp là chuỗi
    const data = {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      displayName,
      otp: String(otp),
      gender,
      role: role || "user",
    };

    const validate = new Validator(data, rules);

    if (validate.fails()) {
      const errors = Object.entries(validate.errors.errors)
        .map(([field, messages]) => messages.map((message) => message))
        .flat();
      return res.status(400).send(resHelper.error(400, "Bad Request", errors));
    }
    const user = await User.findOne({ attributes: ["id"], where: { email } });
    if (user) return res.status(409).send(resHelper.error(409, "Conflict", "Email already used"));
    res.locals.data = data;
    next();
  } catch (error: any) {
    console.log("registerValidation", error);

    return res.status(500).send(resHelper.error(500, "Internal Server Error"));
  }
};

const resetPwValidation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, confirmPassword, otp } = req.body;
    const rules: Validator.Rules = {
      email: "required|email",
      password: "required|min:6",
      confirmPassword: "required|same:password",
      otp: "required|digits:6",
    };

    // Đảm bảo otp là chuỗi
    const data = { email, password, confirmPassword, otp: String(otp) };
    const validate = new Validator(data, rules);
    if (validate.fails()) {
      const errors = Object.entries(validate.errors.errors)
        .map(([field, messages]) => messages.map((message) => message))
        .flat();
      return res.status(400).send(resHelper.error(400, "Bad Request", errors));
    }
    res.locals.email = email;
    res.locals.password = password;
    res.locals.otp = otp;
    next();
  } catch (error: any) {
    return res.status(500).send(resHelper.error(500, "Internal Server Error"));
  }
};

export default { otpRegisterValidation, registerValidation, resetPwValidation };

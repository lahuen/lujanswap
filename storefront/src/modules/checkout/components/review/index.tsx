"use client"

import { Heading, Text, clx, Label, RadioGroup } from "@medusajs/ui"
import { useState } from "react"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import Input from "@modules/common/components/input"
import { isManualBarter } from "@lib/constants"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const [barterCash, setBarterCash] = useState("")
  const [barterItem, setBarterItem] = useState("")
  const [barterNote, setBarterNote] = useState("")
  const [barterType, setBarterType] = useState("cash")

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const hasActivePaymentSession = cart?.payment_collection?.payment_sessions?.some(
    (session: any) => session.status === "pending"
  )

  const isBarterPayment = !paidByGiftcard && !hasActivePaymentSession

  const cashAmount = barterCash ? parseFloat(barterCash) : 0
  const hasCash = cashAmount > 0
  const hasItem = barterItem && barterItem.trim().length > 0
  const isCashPayment = hasCash && !hasItem
  const isBarterProposal = hasItem && !hasCash

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard || isBarterPayment)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Revisión
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          {isBarterPayment && (
            <div className="flex flex-col gap-y-4 mb-6">
              <Heading level="h3" className="text-xl-regular">
                Opciones de pago
              </Heading>

              {/* @ts-ignore */}
              <RadioGroup
                className="flex gap-4"
                value={barterType}
                onValueChange={setBarterType}
              >
                <div className="flex items-center gap-x-2">
                  <RadioGroup.Item value="cash" id="radio_cash" />
                  <Label htmlFor="radio_cash" className="cursor-pointer">Efectivo / Transferencia</Label>
                </div>
                <div className="flex items-center gap-x-2">
                  <RadioGroup.Item value="barter" id="radio_barter" />
                  <Label htmlFor="radio_barter" className="cursor-pointer">Canje / Mixto</Label>
                </div>
              </RadioGroup>

              {barterType === "cash" && (
                <Text className="txt-medium text-ui-fg-subtle">
                  La compra se procesará inmediatamente con el pago en efectivo o transferencia.
                </Text>
              )}

              {barterType === "barter" && (
                <div className="flex flex-col gap-y-4">
                  <Text className="txt-medium text-ui-fg-subtle">
                    Tu propuesta será revisada y aceptada o rechazada manualmente.
                  </Text>
                  <Input
                    type="number"
                    label="Efectivo ofrecido"
                    name="barter_cash"
                    value={barterCash}
                    onChange={(e) => setBarterCash(e.target.value)}
                    topLabel="Ofrezco en efectivo"
                    data-testid="barter-cash-input"
                  />
                  <Input
                    type="text"
                    label="Especie ofrecida"
                    name="barter_item"
                    value={barterItem}
                    onChange={(e) => setBarterItem(e.target.value)}
                    topLabel="Ofrezco en especie"
                    data-testid="barter-item-input"
                  />
                  <div className="flex flex-col w-full">
                    <Label className="mb-2 txt-compact-medium-plus">
                      Nota
                    </Label>
                    <textarea
                      name="barter_note"
                      value={barterNote}
                      onChange={(e) => setBarterNote(e.target.value)}
                      placeholder="Nota adicional sobre el acuerdo (ej: entrega en mano)"
                      className="pt-4 pb-1 block w-full min-h-[100px] px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover resize-y"
                      data-testid="barter-note-input"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Al hacer clic en el botón Realizar pedido, confirmas que has
                leído, entendido y aceptas nuestros Términos de uso, Términos de venta y
                Política de devoluciones y reconoces que has leído la Política de privacidad de
                LUJAN SWAP.
              </Text>
            </div>
          </div>
          <PaymentButton
            cart={cart}
            barterData={
              isBarterPayment
                ? barterType === "cash"
                  ? { cash: (cart?.total ? (cart.total / 100).toString() : "0"), item: "", note: "" }
                  : {
                    cash: barterCash,
                    item: barterItem,
                    note: barterNote,
                  }
                : undefined
            }
            data-testid="submit-order-button"
          />
        </>
      )}
    </div>
  )
}

export default Review
